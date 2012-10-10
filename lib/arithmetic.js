// arithmetic

var i
  , arith = {
      add: function(a, b) {
        return a + b;
      },
      sub: function(a, b) {
        return a - b;
      },
      mul: function(a, b) {
        return a * b;
      },
      div: function(a, b) {
        return a / b;
      },
      gt: function(a, b) {
        return a > b;
      },
      lt: function(a, b) {
        return a < b;
      },
      gte: function(a, b) {
        return a >= b;
      },
      lte: function(a, b) {
        return a <= b;
      },
      eq: function(a, b) {
        return a === b;
      },
      mod: function(a, b) {
        return a % b;
      }
    };

for (i in arith) {
  exports[i] = arith[i];
}
