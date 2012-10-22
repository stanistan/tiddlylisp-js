// the parser

var envs = require('./env.js')
  , _ = require('./utils.js')
  , t = require('./parser/tokens.js')
  , expanders = require('./parser/expanders.js').fns
  , Symbol = _.Symbol
  , str = _.str
  , file = require('./file.js');

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
    , 'put': function(x) {
        var evd = x.map(ce);
        return env.setProp(evd[0], evd[1], evd[2]);
      }
    , 'get': function(x) {
        var evd = x.map(ce);
        return env.getProp(evd[0], evd[1]);
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

          // return new _.Lambda(x[1], lenv, args, e);
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
    , 'gensym': function(x) {
        return new Symbol('GS#' + ce(x[0]));
      }
    , 'unquote': function(x) {
        return ce(x.map(ce)[0]);
      }
    ,
  };

  // Variable access
  if (_.isa(x, Symbol)) {
    var val = env.value(x.val);
    return (_.isObject(val) && !_.isa(val, Symbol)) ? _.objectToPairs(val) : val;
  }

  // Self-evaluating forms
  if (!_.isArray(x)) {
    return x;
  }

  var n = x[0].val;

  // Special operators
  if (n in fns) {
    return fns[n](_.rest(x), n);
  }

  var f = ce(x[0])
    , exps;

  // Macroexpansion
  if (_.isArray(f) && _.findKeyInPairs(f, 'macro')) {
    console.log(JSON.stringify(x));
    return ce([new Symbol('macroexpand1'), x]); // xxx
  } else if (_.isFunction(f)) {
    // Function application
    return f.apply(null, _.rest(x).map(ce));
  }



  var handleResponse = function(re) {
    return _.isa(re, _.Lambda) ? re.invoke() : re;
  };

  if (_.isArray(f) && _.findKeyInPairs(f, 'macro')) {

    f = (env.getProp(x[0], 'macro')).apply(null, _.rest(x));
    f.macroexpandBody();

    return ce(handleResponse(f));
  }

  exps = x.map(ce);
  f = exps.shift();

  return handleResponse(f.apply(null, exps));
};

var Parser = function() {
  this.env = envs.initGlobal();
};

Parser.prototype = {
    tokenize: t.tokenize
  , reader: t.reader
  , e: function(x) {
      return str(evaluate(x, this.env));
    }
  , parse: function(s) {
      var tokens = t.tokenize(s);
      return (s.length && !tokens.length) ? '' : this.e(t.read(tokens));
    }
  , getEnv: function() {
      return this.env;
    }
};

exports.Parser = Parser;
