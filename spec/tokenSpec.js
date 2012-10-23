var _ = require('./../lib/parser/tokens.js')
  , Symbol = require('./../lib/utils.js').Symbol;

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

describe('with-expanding', function() {
  it('should work if the symbols are next to each other', function() {
    var l = ',@body';
    expect(_.tokenize(l)).toEqual(['(', 'unquote', '(', 'splice', 'body', ')', ')']);
  });
});

describe('reader', function() {

  var reader = _.reader;

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

