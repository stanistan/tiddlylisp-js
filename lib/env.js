// env

var _ = require('./utils.js')
  , arith = require('./arithmetic.js')
  , globals = {
      '+': function() { return _.args(arguments).reduce(arith.add); }
    ,  '-': function() { return _.args(arguments).reduce(arith.sub); }
    , '*': function() { return _.args(arguments).reduce(arith.mul); }
    , '/': function() { return _.args(arguments).reduce(arith.div); }
    , '%': arith.mod
    , '>': arith.gt
    , '<': arith.lt
    , '>=': arith.gte
    , '<=': arith.lte
    , '=': arith.eq
    , 'true': true
    , 'false': false
    , 'null': null
    , 'print': function() { console.log.apply(null, _.args(arguments).map(_.str)); }
    };

var Env = function(params, args, outer) {
  this.content = _.zipmap(params || [], args || []);
  this.outer = outer || null;
};

Env.prototype = {
  find: function(k) {
    if (k in this.content) {
      return this.content;
    } else if (this.outer) {
      return this.outer.find(k);
    }

    throw "var [" + k + "] is not defined.";
  },
  set: function(k, v) {
    this.content[k] = v;
    return this;
  },
  update: function(o) {
    for (var i in o) {
      this.set(i, o[i]);
    }

    return this;
  }
};

var makeEnv = function(params, args, outer) {
  var e = new Env(params, args, outer || null);
  return e;
};

var makeGlobalEnv = function(params, args, outer) {
  return makeEnv(params, args, outer || null).update(globals);
};

exports.init = makeEnv;
exports.initGlobal = makeGlobalEnv;
