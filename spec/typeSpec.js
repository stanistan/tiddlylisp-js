var ts = require('./../lib/types.js')
  , _ = require('./../lib/utils.js');

describe('tokens/ type inheritence', function() {

  it('should be itself', function() {
    var a = new ts.Token;
    expect(_.isa(a, ts.Token)).toBe(true);
  });

  it('special should be a token', function() {
    var sp = new ts.Special('@', 'macrosplice');
    expect(_.isa(sp, ts.Token)).toBe(true);
    expect(_.isa(sp, ts.Special)).toBe(true);
    expect(_.isa(sp, ts.Symbol)).toBe(false);
  });

  it('symbol should not be a special', function() {
    var s = new ts.Symbol('sup');
    expect(_.isa(s, ts.Symbol)).toBe(true);
    expect(_.isa(s, ts.Token)).toBe(true);
    expect(_.isa(s, ts.Special)).toBe(false);
  });

});
