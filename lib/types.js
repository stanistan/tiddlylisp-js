// tokens and types

var _ = require('./utils.js');

// genertic Token Type
//////////////////
var Token = function() {};

// Symbol Type -- has variable names
//////////////////
var Symbol = function(v) {
  this.val = v;
};

Symbol.prototype = new Token;
Symbol.prototype.constructor = Symbol;
Symbol.prototype.toString = function() {
  return this.val;
};

// macroquote, etc
//////////////////
var Special = function(token, type) {
  this.token = token;
  this.type = type || specials[token].type;
};

Special.prototype = new Token;
Special.prototype.constructor = Symbol;
Special.prototype.toString = function(exp) {
  return this.token;
};

var specials = {
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

// Helpers

var isSpecial = function(a) {
      return _.isa(a, Special);
    }
  , isToken = function(a) {
      return _.isa(a, Token);
    }
  , isSymbol = function(a) {
      return _.isa(a, Symbol);
    };

exports.specials = specials;
exports.Special = Special;
exports.isSpecial = isSpecial;

exports.Symbol = Symbol;
exports.isSymbol = isSymbol;

exports.Token = Token;
exports.isToken = isToken;
