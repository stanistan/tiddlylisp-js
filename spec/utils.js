var _ = require('./../lib/utils.js');

describe('zipmap', function() {

  it('should work', function() {
    expect(_.zip(['a', 'b', 'c'], [1, 2, 3])).tobe({a: 1, b: 2, c: 3})
  });

});
