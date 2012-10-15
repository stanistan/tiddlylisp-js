(define t
  (lambda (x)
    (begin
      (print x)
      (current-counter-state)
      (if (= 10 x) x (recur (inc x))))))

(run 1 (t 1))
(run 2 (t 1))
(run 3 (t 1))


