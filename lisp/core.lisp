;; Core Library of this tiddlylisp.

(define caar (lambda (x) (car (car x))))
(define cadr (lambda (x) (car (cdr x))))
(define cadar (lambda (x) (cadr (car x))))
(define caddr (lambda (x) (cadr (cdr x))))
(define caddar (lambda (x) (caddr (car x))))

(define identity
  (lambda (x)
    x))

(define comp1
  (lambda (f1 f2)
    (lambda (& args)
      (f1 (apply f2 args)))))

(define first car)

(define rest cdr)

(define second
  (comp1 first rest))

(define ffirst
  (comp1 first first))

(define frest
  (comp1 rest first))

(define count
  (lambda (x)
    (if (null? x) 0
      (+ 1 (count (rest x))))))

(define list
  (lambda (& args)
    args))

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

(define comp
  (lambda (& fns)
    (if (> (count fns) 2)
      (apply recur (append (butlast (butlast fns))
                          (list (comp1 (last (butlast fns)) (last fns)))))
      (apply comp1 (list (first fns) (second fns))))))

(define partial1
  (lambda (f a)
    (lambda (& args)
      (apply f (cons a args)))))

(define partial
  (lambda (f & args)
    (if (null? args)
      f
      (apply partial (cons (partial1 f (car args))
                           (cdr args))))))

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

(define nth
  (lambda (s n)
    (if (null? s) null
      (begin
        (cond
          ((= n 0) (first s))
          ((= n 1) (second s))
          (true (nth (rest s) (dec n))))))))

(define swap
  (lambda ((x y))
    (list y x)))

(define for
  (lambda (start end f)
    (begin
      (if (>= start end) null
        (begin
          (f start)
          (recur (inc start) end f))))))

(define butlast
  (lambda (s)
    (if (null? s) null
      (begin
        (define l (count s))
        (define acc '())
        (for 0 l
          (lambda (i)
            (when (> (dec l) i)
              (set! acc (append acc (list (nth s i)))))))
        acc))))

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
    (begin
      (set! a (if (null? a) '() a))
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
          (eval (caddar e) (append (pairlis (cadar e) (evlis (cdr e) a)) a)))))))

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
  (eval 'x '((x test-value)))
  'test-value)

(assert-equal
  (eval 'y '((y (1 2 3))))
  '(1 2 3))

(assert-not-equal
  (eval 'z '((z ((1) 2 3))))
  '(1 2 3))

(assert-equal
  (eval '(quote 7) '())
  '7)

(assert-equal
  (eval (q (atom? '(1 2))) '())
  false)

(assert-equal
  (eval '(eq? 1 1) '((1 1)))
  true)

(assert-equal
  (eval '(eq? 1 2) '((1 1) (2 2)))
  false)

(assert-equal
  (eval '(eq? 1 1) '((1 1)))
  true)

(assert-equal
  (eval '(car '(3 2)) '())
  '3)

(assert-equal
  (eval '(cdr '(1 2 3)) '())
  '(2 3))

(assert-not-equal
  (eval '(cdr '(1 (2 3) 4)) '())
  '(2 3 4))

(assert-equal
  (eval
    '(cons 1 (q (2 3)))
    '((1 1)(2 2)(3 3)))
  '(1 2 3))

(assert-equal
  (eval '(cond ((atom? x) 'x-atomic)
           ((atom? y) 'y-atomic)
           ('true 'nonatomic))
        '((x 1) (y (3 4))))
  'x-atomic)

(assert-equal
  (eval '(cond ((atom? x) 'x-atomic)
           ((atom? y) 'y-atomic)
           ('true 'nonatomic))
        '((x (1 2)) (y 3)))
  'y-atomic)

(assert-equal
  (eval '(cond ((atom? x) 'x-atomic)
           ((atom? y) 'y-atomic)
           ('true 'nonatomic))
        '((x (1 2)) (y (3 4))))
  'nonatomic)

(assert-equal
  (eval
    '((lambda (x) (car (cdr x))) '(1 2 3 4))
    '())
  2)

(define macroexpand
  (lambda (exp)
    (if (atom? exp)
        exp
        (if (get (car exp) 'special-form)
            ((get (car exp) 'special-form) exp)
            (if (get (car exp) 'macro)
                (macroexpand ((get (car exp) 'macro) (cdr exp)))
                (map macroexpand exp))))))

(define-macro 'and
  (lambda (& args)
    (if (null? args)
        t
        (if (null? (cdr args))
            (car args)
            (list 'if (car args) (cons 'and (cdr args)))))))

(define-macro 'or
  (lambda (& args)
    (if (null? args)
        nil
        (if (null? (cdr args))
            (car args)
            (list
              ((lambda (test-var)
                (list 'lambda (list test-var)
                  (list 'if test-var test-var (cons 'or (cdr args)))))
               (gensym))
              (car args))))))

(define-macro 'let
  (lambda (& args)
    (cons
      (cons 'lambda (cons (map car (car args)) (cdr args)))
      (map cadr (car args)))))
