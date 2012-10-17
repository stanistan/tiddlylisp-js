var envs = require('./../lib/env.js');

describe('initialize empty global env', function() {
  var t = envs.initGlobal([], []);
  it('should find global fns in its context', function() {
    expect(t.find('cons')).toEqual(t.content);
  });
  it('should be settable', function() {
    t.set('test', 'value');
    expect(t.find('test')['test']).toEqual('value');
  });
  it('should be updatable in batch', function() {
    t.update({a: 1, b: 2});
    expect(t.find('a')['a']).toEqual(t.value('a'));
    expect(t.value('a')).toEqual(t.content['a']);
    expect(t.value('a')).toEqual(1);
    expect(t.value('b')).toEqual(2);
  });
});

describe('initializing a context with zip', function() {
  var t = envs.initGlobal(['a'], [1]);
  it('should set values', function() {
    expect(t.value('a')).toEqual(1);
  });
});

describe('inner env', function() {
  var global = envs.initGlobal([], [])
    , e = envs.init([], [], global);

  e.set('a', 1);
  it('should have its own and outer data', function() {
    expect(e.value('a')).toEqual(1);
    expect(e.find('cons')).toEqual(e.outer.content);
  });

  it('should throw for things not found', function() {
    try {
      e.value('non-exists');
    } catch (e) {
      expect(e.type).toEqual('undeclared');
    }
  });
});

describe('using metadata [put|get]', function() {
  var e = envs.initGlobal();
  it('is settable', function() {
    e.setProp('a', 'b', 1);
    e.setProp('a', 'c', 2);
    expect(e.getProp('a', 'b')).toEqual(1);
    expect(e.getProp('a', 'c')).toEqual(2);
  });
  var e2 = envs.init([],[], e);
  it('is nestable', function() {
    expect(e2.getProp('a', 'b')).toEqual(e.getProp('a', 'b'));
  });
  it('returns null for things not found', function() {
    expect(e.getProp('a', 'a')).toBe(null);
    expect(e.getProp('b', 'c')).toBe(null);
    expect(e2.getProp('asdfadf', 'sdfasdf')).toBe(null);
  });
});
