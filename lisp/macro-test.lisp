(define a 1)
(define b 2)

(print `(+ a b))

(print `(+ ,a b))

(print (unquote `(,+ ,a ,b)))

(defmacro 't
  (lambda (x y)
    `(,y ,x)))

(print (t 1 2))

; (print `(a b))

; (defmacro 'test
;   (lambda (a b)
;     (begin
;       (print 'vars a b)
;       `(,+ ,a ,b))))


; (print 'result: (test 1 2))
