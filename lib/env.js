// env

var _ = require('./utils.js')
  , types = require('./types.js')
  , arith = require('./arithmetic.js')
  , gs = {
      '+': function() { return _.args(arguments).reduce(arith.add); }
    , '-': function() { return _.args(arguments).reduce(arith.sub); }
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
    , 'str': function() { return '"' + _.args(arguments).map(_.stripQuotes).map(_.str).join('') + '"'; }
    , 'symbol?': function(x) { return types.isSymbol(x); }
    , 'null?': function(x) {
        return typeof x[0] == 'undefined' || x[0] === null || (_.isArray(x[0]) && !x[0].length);
      }
    , 'seq': function() {
        return _.arrMerge.apply(null, _.args(arguments).map(_.splitStr));
      }
    , 'car': function(x) { return x[0]; }
    , 'cdr': function(x) { return _.rest(x); }
    , 'atom?': function(x) { return !_.isArray(x); }
    , 'cons': function() {
        var args = _.args(arguments);
        return [].concat.apply([args[0]], _.rest(args));
      }
    , 'apply': function(f, args) {
        return f.apply(null, args);
      }
    }
  , globals = {};

for (var i in gs) {
  globals[i] = new types.Value(gs[i]);
}

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

      _.error('undeclared', "var [" + k + "] is not defined.");

    }
  , set: function(k, v) {
      this.content[k] = v;
      return this;
    }
  , update: function(o) {
      for (var i in o) {
        this.set(i, o[i]);
      }

      return this;
    }
  , value: function(k) {
      return this.find(k)[k];
    }
};

var makeEnv = function(params, args, outer) {
  return new Env(params, args, outer || null);
};

var makeGlobalEnv = function(params, args, outer) {
  return makeEnv(params, args, outer || null).update(globals);
};

exports.init = makeEnv;
exports.initGlobal = makeGlobalEnv;
