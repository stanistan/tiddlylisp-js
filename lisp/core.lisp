(define caar (lambda (x) (car (car x))))
(define cadr (lambda (x) (car (cdr x))))
(define cadar (lambda (x) (cadr (car x))))
(define caddr (lambda (x) (cadr (cdr x))))
(define caddar (lambda (x) (caddr (car x))))

(define comp
  (lambda (f1 f2)
    (lambda (x)
      (f1 (f2 x)))))

(define first
  (lambda (s)
    (car s)))

(define rest
  (lambda (s)
    (cdr s)))

(define second
  (comp first rest))

(define ffirst
  (comp first first))

(define frest
  (comp rest first))

(define not
  (lambda (x)
    (if x false true)))

(define inc
  (lambda (x)
    (+ x 1)))

(define dec
  (lambda (x)
    (- x 1)))

(define last
  (lambda (s)
    (begin
      (define check
        (lambda (seq)
          (if (null? (rest seq))
            (first seq)
            (check (rest seq)))))
      (if (null? s) null (check s)))))

(define map
  (lambda (f s)
    (if (null? s) s
      (cons (f (car s)) (map f (cdr s))))))

(define filter
  (lambda (fn s)
    (if (null? s) s
      (begin
        (define f (first s))
        (define r (rest s))
        (if (fn f)
          (cons f (filter fn r))
          (filter fn r))))))

(define reduce
  (lambda (f init s)
    (begin
      (define reducer
        (lambda (f init s)
          (if (null? s) init
            (reducer f (f init (first s)) (rest s)))))
      (set! s (if (null? s) init s))
      (set! init (if (= s init) (first s) init))
      (set! s (if (= init (first s)) (rest s) s))
      (reducer f init s))))

(define append
  (lambda (x y)
    (if (null? x) y (cons (first x) (append (rest x) y)))))

(define pair
  (lambda (x y)
    (cons x (cons y (quote ())))))

(define pairlis
  (lambda (x y)
    (if (null? x)
      (q ())
      (cons (pair (first x) (first y))
            (pairlis (rest x) (rest y))))))

(define assoc
  (lambda (x y)
    (if (null? y) y
      (if (eq? (caar y) x) (cadar y) (assoc x (cdr y))))))

(define even?
  (lambda (x)
    (= 0 (% x 2))))

(define odd?
  (comp not even?))

(define eval
  (lambda (e a)
    (cond
      ((atom? e)
        (assoc e a))
      ((atom? (car e))
        (cond
          ((eq? (car e) (q car))
            (car (eval (cadr e) a)))
          ((eq? (car e) (q cdr))
            (cdr (eval (cadr e) a)))
          ((eq? (car e) (q cons))
            (cons (eval (cadr e) a) (eval (caddr e) a)))
          ((eq? (car e) (q atom?))
            (atom? (eval (cadr e) a)))
          ((eq? (car e) (q eq?))
            (eq? (eval (cadr e) a) (eval (caddr e) a)))
          ((eq? (car e) (q quote))
            (cadr e))
          ((eq? (car e) (q q))
            (cadr e))
          ((eq? (car e) (q cond))
            (evcon (cdr e) a))
          (true
            (eval (cons (assoc (car e) a) (cdr e)) a))))
      ((eq? (caar e) (q lambda))
        (eval (caddar e) (append (pairlis (cadar e) (evlis (cdr e) a)) a))))))

(define evcon
  (lambda (c a)
    (cond
      ((eval (caar c) a)
        (eval (cadar c) a))
      (true
        (evcon (cdr c) a)))))

(define evlis
  (lambda (m a)
    (cond
      ((null? m)
        (q ()))
      (true
        (cons (eval (car m) a) (evlis (cdr m) a))))))

(define check-assertion
  (lambda (x y re)
    (when (eq? false re)
      (begin
        (define not? (= (eq? x y) re))
        (define start (if not? "assert-not-equal " "assert-equal"))
        (print (str "Test Failed: --- (" start " " x " " y ")"))))))

(define assert-equal
  (lambda (x y)
    (check-assertion x y (eq? x y))))

(define assert-not-equal
  (lambda (x y)
    (check-assertion x y (not (eq? x y)))))

(assert-equal
  (eval (q x) (q ((x test-value))))
  (q test-value))

(assert-equal
  (eval (q y)
        (q ((y (1 2 3)))))
  (q (1 2 3)))

(assert-not-equal
  (eval (q z) (q ((z ((1) 2 3)))))
  (q (1 2 3)))

(assert-equal
  (eval (q (quote 7)) (q ()))
  (q 7))

(assert-equal
  (eval (q (atom? (q (1 2)))) (q ()))
  false)

(assert-equal
  (eval (q (eq? 1 1)) (q ((1 1))))
  true)

(assert-equal
  (eval (q (eq? 1 2)) (q ((1 1) (2 2))))
  false)

(assert-equal
  (eval (q (eq? 1 1)) (q ((1 1))))
  true)

(assert-equal
  (eval (q (car (q (3 2)))) (q ()))
  (q 3))

(assert-equal
  (eval (q (cdr (q (1 2 3)))) (q ()))
  (q (2 3)))

(assert-not-equal
  (eval (q (cdr (q (1 (2 3) 4)))) (q ()))
  (q (2 3 4)))

(assert-equal
  (eval
    (q (cons 1 (q (2 3))))
    (q ((1 1)(2 2)(3 3))))
  (q (1 2 3)))

(assert-equal
  (eval (q (cond ((atom? x) (q x-atomic))
           ((atom? y) (q y-atomic))
           ((q True) (q nonatomic))))
        (q ((x 1)(y (3 4)))))
  (q x-atomic))

(assert-equal
  (eval (q (cond ((atom? x) (q x-atomic))
           ((atom? y) (q y-atomic))
           ((q true) (q nonatomic))))
        (q ((x (1 2))(y 3))))
  (q y-atomic))

(assert-equal
  (eval (q (cond ((atom? x) (q x-atomic))
           ((atom? y) (q y-atomic))
           ((q true) (q nonatomic))))
        (q ((x (1 2))(y (3 4)))))
  (q nonatomic))

(assert-equal
  (eval
    (q ((lambda (x) (car (cdr x))) (q (1 2 3 4))))
    (q ()))
  2)
