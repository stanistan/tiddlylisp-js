var _ = require('./../lib/parser.js')
  , Symbol = require('./../lib/utils.js').Symbol;

describe('parser', function() {
  var parser = new _.Parser()  // creates a parser with an environment
    , p = function(s) { return parser.parse(s); };

  it('returns an empty string for a line comment', function() {
    expect(p(';; this is a comment')).toEqual('');
  });

  it('throws EOF if missing closing parens', function() {
    try {
      p('(');
    } catch (e) {
      expect(e.type).toEqual('eof');
    }
  });

  it('defines set things in the parser\'s env.', function() {
    expect(p('(define a 1)')).toEqual(1);
    expect(p('a')).toEqual(1);
  });

  it('throws undeclared if reading undefined property', function() {
    try {
      p('b');
    } catch (e) {
      expect(e.type).toEqual('undeclared');
    }
  });

  it('evalutates built in functions', function() {
    expect(p('(+ 1 2)')).toEqual(3);
  });

  it('evaluates user-defined functions', function() {
    p('(define t (lambda (x y) (+ x y)))');
    expect(p('(t 1 2)')).toEqual(3);
  });

});
