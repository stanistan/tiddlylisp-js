(run 1000
  (begin
    (define t
      (lambda (x)
        (begin
          (print x)
          (current-counter-state)
          (if (= 10 x) x (recur (inc x))))))
    (t 1)))
