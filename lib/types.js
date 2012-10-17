// tokens and types

var _ = require('./utils.js')
  , specials = {
        '`': {
            type: 'macroquote'
        }
      , '@': {
            type: 'macrosplice'
        }
      , ',': {
          type: 'macroeval'
        }
    };

// genertic Token Type

var Token = function() {};

// Symbol Type -- has variable names

var Symbol = function(v) {
  this.val = v;
};

Symbol.prototype = new Token;
Symbol.prototype.constructor = Symbol;
Symbol.prototype.toString = function() {
  return this.val;
};

// macroquote, etc

var Special = function(token, type) {
  this.token = token;
  this.type = type || specials[token].type;
};

Special.prototype = new Token;
Special.prototype.constructor = Symbol;
Special.prototype.toString = function(exp) {
  return this.token;
};

// Value

var Value = function(value, meta) {
  this.val = value;
  this.meta = meta || {};
};

Value.prototype = new Token;
Value.prototype.constructor = Value;
Value.prototype.getMeta = function(k) {
  return typeof k == 'undefined' ? this.meta : this.meta[k];
};
Value.prototype.setMeta = function(k, v) {
  this.meta[k] = v;
  return this;
};
Value.prototype.mergeMeta = function(a) {
  a = a || {};
  for (var i in a) {
    this.setMeta(i, a[i]);
  }
  return this;
};

// Helpers

var isSpecial = function(a) {
      return _.isa(a, Special);
    }
  , isToken = function(a) {
      return _.isa(a, Token);
    }
  , isSymbol = function(a) {
      return _.isa(a, Symbol);
    }
  , isValue = function(a) {
      return _.isa(a, Value);
    };

exports.specials = specials;
exports.Special = Special;
exports.isSpecial = isSpecial;

exports.Symbol = Symbol;
exports.isSymbol = isSymbol;

exports.Token = Token;
exports.isToken = isToken;

exports.Value = Value;
exports.isValue = isValue;
