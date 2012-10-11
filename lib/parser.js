// the parser

var envs = require('./env.js')
  , _ = require('./utils.js')
  , Symbol = _.Symbol
  , str = _.str;

var expandQuotes = function recur(tokens) {

  var expanded = []
    , open = 0
    , quoted = false
    , openQuote = function() {
        expanded = expanded.concat('(', 'q');
        quoted = true;
      }
    , closeQuote = function() {
        expanded.push(')');
        quoted = false;
      };

  tokens.forEach(function(v, k) {

    if (v == "'" && !quoted) {
      openQuote();
      return;
    }

    expanded.push(v);

    if (quoted) {
      if (v == '(') {
        open++;
      } else if (v == ')') {
        open--;
      }

      if (!open) {
        closeQuote();
      }
    }

  });

  if (quoted) {
    closeQuote();
  }

  return tokens.length == expanded.length ? expanded : recur(expanded);
};

var tokenize = function(str) {

  var state = []
    , tokens = []
    , current = []
    , escape = false
    , isDelim = function(s) {
        return s === '"';
      }
    , currState = function() {
        return (!!state.length) ? _.last(state) : null;
      }
    , isCurrStateDelim = function(c) {
        return isDelim(c) && currState() === c;
      }
    , addToken = function() {
        tokens.push(current.join(""));
        current = [];
      }
    , iter = function(ch) {

        var c = currState();

        if (!escape && !c) {
          if (['(', ')'].indexOf(ch) >= 0) {
            addToken();
            current = [ch];
            ch = ' ';
          } else if (ch == "'") {
            addToken();
            current = [ch];
            ch = ' ';
          }

          if (ch == ' ') {
            addToken();
            return;
          }
        }

        current.push(ch);

        if (escape) {
          escape = false;
        } else if (ch === '\\') {
          escape = true;
        } else if (!c && isDelim(ch)) {
          state.push(ch);
        } else if (isCurrStateDelim(ch)) {
          state.pop();
        }
      }
    , hasLength = function(i) {
        return i.length > 0;
      };

  str.split("").forEach(iter);
  addToken();

  return expandQuotes(tokens.map(_.trim).filter(hasLength));
};

var evaluate = function e(x, env) {

  var ce = function(x) {
    return e(x, env);
  };

  var quote = function(x) {
    return x[0];
  };

  var fns = {
      'quote': quote
    , 'q': quote
    , 'eq?': function(x) {
        var v1 = ce(x[0])
          , v2 = ce(x[1])
          , val = function(v) {
              return JSON.stringify(v || []);
            };

        return val(v1) == val(v2);
      }
    , 'cond': function(x) {
        return x.reduce(function(a, b) {
          return (a) ? a : ((ce(b[0])) ? ce(b[1]) : false)
        }, false);
      }
    , 'if': function(x) {
        var test = x[0], cons = x[1], alt = x[2];
        return ce((ce(test) ? cons : alt));
      }
    , 'when': function(x) {
        var test = x[0], cons = x[1];
        return ce(test) ? ce(cons) : null;
      }
    , 'set!': function(x) {
        var v = ce(x[1]);
        env.find(x[0].val)[x[0].val] = v;
        return v;
      }
    , 'define': function(x) {
        var v = ce(x[1]);
        env.set(x[0].val, v);
        return typeof v === 'function' ? '' : str(v);
      }
    , 'lambda': function(x) {
        var vals = function(a) {
          return a.val;
        };

        return function recur() {
          var args = _.destructure(x[0].map(vals), _.args(arguments))
            , lenv = envs.init([], [], env).set('recur', recur).update(args);

          return e(x[1], lenv);
        };
      }
    , 'begin': function(x) {
        return x.reduce(function(a, b) { return ce(b); }, null);
      }
  };

  if (_.isa(x, Symbol)) {
    return env.find(x.val)[x.val];
  }

  if (!_.isArray(x)) {
    return x;
  }

  if (x[0].val in fns) {
    return fns[x[0].val](_.rest(x), x[0].val);
  }

  var exps = x.map(ce), f = exps.shift();

  return f.apply(null, exps);
};


var reader = function r(tokens) {

  if (!tokens.length) {
    throw { type: 'eof', message: 'Unexpected EOF'};
  }

  var token = tokens.shift();
  if (token == '(') {
    var L = [];
    while (tokens[0] != ')') {
      L.push(r(tokens).found);
    }
    tokens.shift();
    return { found: L, rest: tokens };
  }

  if (token == ')') {
    throw { type: 'closing', message: 'Unexpected )' };
  }

  return { found: _.atom(token), rest: tokens };
};

var read = function(tokens) {
  return reader(tokens).found;
};

var Parser = function() {
  this.env = envs.initGlobal();
};

Parser.prototype = {
    tokenize: tokenize
  , reader: reader
  , e: function(x) {
      return str(evaluate(x, this.env));
    }
  , parse: function(s) {
      return this.e(read(tokenize(s)));
    }
  , getEnv: function() {
      return this.env;
    }
};

exports.Parser = Parser;
