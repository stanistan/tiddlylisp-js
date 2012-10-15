var _ = require('./utils.js');

var Callable = function(fn, counter) {
  this.fn = fn;
  this.counter = counter || new Counter;
};

Callable.prototype = {
    call: function() {
      if (!this.canCall()) {
        _.error('counter_limit', 'counter limit reached');
      }

      return this.inc().fn.apply(null, _.args(arguments));
    }
  , inc: function() {
      this.counter.inc();
      return this;
    }
  , canCall: function() {
      return !this.counter.limitReached();
    }
};

var Counter = function(limit) {
  this.count = 0;
  this.limit = limit || false;
};

Counter.prototype = {
    inc: function() {
     this.count++;
    }
  , limitReached: function() {
      return this.limit !== false && this.count >= this.limit;
    }
};

exports.Counter = Counter;
exports.Callable = Callable;
