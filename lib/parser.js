// the parser

var envs = require('./env.js')
  , _ = require('./utils.js')
  , Symbol = _.Symbol
  , str = _.str
  , file = require('./file.js');

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

var tokenizeLine = function(str) {

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

  return stripComments(tokens.map(_.trim).filter(hasLength));
};

var stripComments = function(tokenLine) {
  var hasComment = false;
  return tokenLine.filter(function(a) {
    if (hasComment || a.indexOf(';') !== -1) {
      hasComment = true;
      return false;
    }
    return true;
  });
};

var tokenize = function(lines) {
  var tokenized = lines.split("\n").map(tokenizeLine);
  return expandQuotes([].concat.apply([], tokenized));
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
        return typeof v === 'function' ? '[Function]' : str(v);
      }
    , 'lambda': function(x) {
        var vals = function s(a) {
          return (_.isArray(a)) ? a.map(s) : a.val;
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
    , 'load-file': function(x) {
        var p = new Parser();

        // assign current environment to parser
        p.env = env;

        file.load(x.map(ce).map(_.stripQuotes), p, function(p) {
          // assign env back
          env = p.env;
        });

        return '';
    }
  };

  if (_.isa(x, Symbol)) {
    return env.value(x.val);
  }

  if (!_.isArray(x)) {
    return x;
  }

  var n = x[0].val;

  if (n in fns) {
    return fns[n](_.rest(x), n);
  }

  var exps = x.map(ce), f = exps.shift();

  return f.apply(null, exps);
};


var reader = function r(tokens) {

  if (!tokens.length) {
    _.error('eof', 'Unexpected EOF');
  }

  var token = tokens.shift()
    , L = []
    , f = function(a) {
        return {
            found: a
          , rest: tokens
        }
      };

  if (token == '(') {

    while (tokens[0] != ')') {
      L.push(r(tokens).found);
    }

    tokens.shift();

    return f(L);
  }

  if (token == ')') {
    _.error('closing', 'Unexpected )');
  }

  return f(_.atom(token));
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
      var tokens = tokenize(s);
      return (s.length && !tokens.length) ? '' : this.e(read(tokens));
    }
  , getEnv: function() {
      return this.env;
    }
};

exports.Parser = Parser;
exports.expandQuotes = expandQuotes;
exports.tokenizeLine = tokenizeLine;
exports.stripComments = stripComments;
