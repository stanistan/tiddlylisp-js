var _ = require('./../lib/utils.js');

describe('zipmap', function() {
  var arg1 = ['a', 'b', 'c']
    , arg2 = [1, 2, 3]
    , re = {a: 1, b: 2, c: 3};

  it('should work', function() {

    expect(_.zipmap(arg1, arg2)).toEqual(re);

    var arg = arg2.concat(4);

    expect(_.zipmap(arg1, arg)).toEqual(re);
  });
});

describe('args', function() {
  it('should return an array', function() {
    expect((function() { return _.args(arguments); })(1, 2, 3)).toEqual([1, 2, 3]);
  });
});

describe('identity', function() {
  it('should return itself', function() {
    expect(_.identity(1)).toEqual(1);
    expect(_.identity({a: 1})).toEqual({a: 1});
  });
});

describe('rest', function() {
  it('should return the rest of the array', function() {
    expect(_.rest([1, 2, 3])).toEqual([2, 3]);
  });
});

describe('last', function() {
  it('should return the end of the array', function() {
    expect(_.last([1, 2, 3])).toEqual(3);
  });
});

describe('trim', function() {
  it('should not have whitespace', function() {
    var s = '   a    ';
    expect(_.trim(s)).toEqual(s.trim());
    expect(_.trim(s)).toEqual('a');
  });
});

describe('isFunction', function() {
  it('should return true on functions', function() {
    expect(_.isFunction(_.isFunction)).toBe(true);
    expect(_.isFunction(expect)).toBe(true);
    expect(_.isFunction(function() {})).toBe(true);
  });
  it('should be false otherwise', function() {
    expect(_.isFunction('string')).toBe(false);
    expect(_.isFunction({})).toBe(false);
    expect(_.isFunction(1)).toBe(false);
  });
});

describe('isArray', function() {
  it('should be true for arrays', function() {
    expect(_.isArray([])).toBe(true);
  });
  it('should be false otherwise', function() {
    expect(_.isArray({})).toBe(false);
    expect(_.isArray(1)).toBe(false);
    expect(_.isArray(_.isArray)).toBe(false);
    expect(_.isArray("abc")).toBe(false);
  });
});

describe('isString', function() {
  it('should return true on strings that start and end with quotes', function() {
    expect(_.isString('"a"')).toBe(true);
  });
  it('should be false otherwise', function() {
    expect(_.isString('a')).toBe(false);
  });
});

describe('str', function() {
  it('returns string representations', function() {
    var s = new _.Symbol('a');
    expect(_.str(function n() { })).toEqual('n');
    expect(_.str(function() { })).toEqual('[Function]');
    expect(_.str('a')).toEqual('a');
    expect(_.str(s)).toEqual('a');
    expect(_.str(['a', 'b', 'c', function() { }, 1])).toEqual('(a b c [Function] 1)');
    expect(_.str(['a', ['list', 1, 2, 3]])).toEqual('(a (list 1 2 3))');
  });
});

describe('atom', function() {
  it('returns value representations', function() {
    expect(_.atom(1)).toEqual(1);
    expect(_.atom('"a"')).toEqual('"a"');
    expect(_.atom('a')).toEqual(new _.Symbol('a'));
  });
});

describe('stripQuotes', function() {
  it('returns string represenations sans quotes', function() {
    expect(_.stripQuotes('"abc"')).toEqual('abc');
    expect(_.stripQuotes('abc')).toEqual('abc');
    expect(_.stripQuotes({})).toEqual({});
  });
});

describe('splitStr', function() {
  it('returns the characters of a "string"', function() {
    expect(_.splitStr('"abcde"')).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

describe('arrMerge', function() {
  it('concatenates arrays', function() {
    expect(_.arrMerge([1], [2], [3])).toEqual([1, 2, 3]);
  });
});

describe('string-repeat', function() {
  it('repeats str',  function() {
    expect('a'.repeat(3)).toEqual('aaa');
  });
});

describe('destructuring', function() {
  it('should equal to zipmap in the simplest case', function() {
    var a = ['a', 'b', 'c']
      , b = [1, 2, 3];
    expect(_.destructure(a, b)).toEqual(_.zipmap(a, b));
  });
  it('should map to rest if there is an &', function() {
    var a = ['a', 'b', 'c', '&', 'd']
      , b = [1, 2, 3, 4, 5, 6, 7];
    expect(_.destructure(a, b)).toEqual({a: 1, b: 2, c: 3, d: [4, 5, 6,7]});
  });
  it('should work with arrays', function() {
    var a = [['a', 'b']]
      , b = [[1, 2]];
    expect(_.destructure(a, b)).toEqual({a: 1, b: 2});
  });
  it('should work recursively', function() {
    var a = ['a', ['a1', 'b2'], '&', ['c', 'd', '&', 'rest']]
      , b = [1, [1, 2], 3, 4, 5, 6, 7]
      , re = _.destructure(a, b);

    expect(re).toEqual({a: 1, a1: 1, b2: 2, c: 3, d: 4, rest: [5, 6, 7]});
  });
});

describe('error', function() {
  it('should throw', function() {
    try {
      _.error('a', 'b');
    } catch (e) {
      expect(e.type).toEqual('a');
      expect(e.message).toEqual('b');
    }
  });
});
