var _ = require('./../lib/parser.js')
  , Symbol = require('./../lib/utils.js').Symbol;

describe('expandQuotes', function() {
  it('should expand around forms', function() {
    var tokens = ["'", "(", "+", "a", "b", ")"]; // '(+ a b) -> (q (+ a b))
    expect(_.expandQuotes(tokens))
      .toEqual(['(', 'q', '(', '+', 'a', 'b', ')', ')']);
  });
  it('should expand around symbols', function() {
    expect(_.expandQuotes(["'", "a"]))          // 'a -> (q a)
      .toEqual(['(', 'q', 'a', ')']);
  });
});

describe('stripComments', function() {
  it('should leave tokens w/o comments alone', function() {
    expect(_.stripComments(['a'])).toEqual(['a']);
  });
  it('should end the tokens where the comment starts', function() {
    expect(_.stripComments(['a', ';', 'other', 'things'])).toEqual(['a']);
  });
  it('should work for more than one semicolon', function() {
    expect(_.stripComments(['a', 'b', ';', 'things']))
      .toEqual(_.stripComments(['a', 'b', ';;a;;;', 'other things']));
  });
});

// line tokenization strips out line comments
describe('tokenizeLine', function() {
  it('should return an array of tokens', function() {
    expect(_.tokenizeLine('(+ a b)')).toEqual(['(', '+', 'a', 'b', ')']);
  });
  it('should ignore comments', function() {
    expect(_.tokenizeLine('(+ a ;; comment)')).toEqual(['(', '+', 'a']);
  });
  it('should work recursively', function() {
    expect(_.tokenizeLine('(list (+ a b c) (* 1 2 3))'))
      .toEqual(['(', 'list', '(', '+', 'a', 'b', 'c', ')', '(', '*', '1', '2', '3', ')', ')']);
  });
  it('should respect strings in quotes', function() {
    expect(_.tokenizeLine('(list "this is a statement")'))
      .toEqual(['(', 'list', '"this is a statement"', ')']);
  });
  it('should do nothing to single quotes', function() {
    expect(_.tokenizeLine("'(1 2 3)")).toEqual(["'", '(', '1', '2', '3', ')']);
  });
});

describe('reader', function() {

  var reader = (new _.Parser()).reader;

  it('reads numerics to floats', function() {
    expect(reader(['(', 1, ')']).found).toEqual([1]);
    expect(reader(['(', 1.0, ')']).found).toEqual([1]);
    expect(reader(['(', '01.0', ')']).found).toEqual([1]);
  });
  it('reads "strings" to "strings"', function() {
    expect(reader(['(', '"a string"', ')']).found).toEqual(['"a string"']);
  });
  it('reads other things to symbols', function() {
    expect(reader(['(', 'a', ')']).found).toEqual([new Symbol('a')]);
  })
});

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
