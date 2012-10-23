; ;(define a 1)
; ;(define b 2)

; ;(print `(+ a b))

; ;(print `(+ ,a b))

; (print 'three? (unquote `(,+ ,a ,b)))

(defmacro 't
  (lambda ((x y))
    `(,+ ,x ,y)))

(print '(should be 3) (t 1 2))

; ; (define add
; ;   (lambda (& args)
; ;     (let ((a (cons + args)))
; ;       (apply partial a))))

; ; (define adder (add 1 2 3 4))

; ; (print (adder 10))

; ; (print (add 1 2 3 4))
; ; (print ())

; ; (print `(a b))

; ; (defmacro 'test
; ;   (lambda (a b)
; ;     (begin
; ;       (print 'vars a b)
; ;       `(,+ ,a ,b))))


; ; (print 'result: (test 1 2))

(print (macroexpand1 '(backquote 10)))
(print (macroexpand1 '(backquote (a b c))))
(print (macroexpand1 '(backquote (a (unquote b) c))))
(print (macroexpand1 '(backquote (a (unquote b) (unquote (splice c))))))
(print (macroexpand1 '(backquote (a (unquote (splice b)) c (unquote (splice d))))))
(print (macroexpand '(backquote (a (unquote (splice b)) c (unquote d)))))
(print (macroexpand1 '(t 1 2)))
