var exps = require('./../lib/parser/expanders.js')
  , e = exps.fns
  , _ = require('./../lib/utils.js');

describe('exports', function() {

  var isFn = function(a) {
    console.log('fn', a);
    return expect(_.isFunction(a)).toBe(true);
  };

  it('should have functions', function() {
    isFn(e.expand_q);
    isFn(e.expand_macroexpandq);
    isFn(e.expand_macroeval);
    isFn(e.expand_macrosplice);
  });

});

var cnf = exps.configuration
  , conf_pt = _.partition(cnf, 2)
  , find = function(n) {
      return conf_pt.reduce(function(p, c) {
        return (p ? p : (c[1].split(' ').join('') == n ? c : null));
      }, null);
    };

var fns = exps.makeExpanders(exps.configuration);

for (var i in fns) {
  (function(i, f) {

    var esc = find(i)[0]
      , r = find(i)[1];

    describe(i, function() {
      it('should expand around forms', function() {
        var tokens = [esc, "(", "+", "a", "b", ")"]; // '(+ a b) -> (q (+ a b))
        expect(f(tokens))
          .toEqual(['(', r, '(', '+', 'a', 'b', ')', ')']);
      });
      it('should expand around symbols', function() {
        expect(f([esc, "a"]))          // 'a -> (q a)
          .toEqual(['(', r, 'a', ')']);
      });
    });

  })(i, fns[i]);
};
