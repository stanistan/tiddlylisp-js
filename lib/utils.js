// utils

var zip = function(a1, a2) {

  a1 = a1 || [], a2 = a2 || [];

  var zipped = {}, l = a1.length, i = 0;

  a1.forEach(function(v, k) {
    zipped[v] = a2[k];
  });

  return zipped;
};

var partition = function(arr, l) {

  var result = []
    , acc = [];

  arr.forEach(function(el, i) {
    if (i % l === 0 && acc.length) {
      result.push(acc);
      acc = [];
    }
    acc.push(el);
  });

  if (acc.length) {
    result.push(acc);
  }

  return result;
};

var args = function(a) {
  return [].slice.call(a);
};

var isa = function(val, test) {
  return val instanceof test;
};

var identity = function(a) { return a; };

var rest = function(a) {
  if (!a.map) {
    console.log(a);
  }
  var re = a.map(identity);
  re.shift();
  return re;
};

var last = function(a) {
  return a[a.length - 1];
};

var trim = function(s) {
  return s.trim();
};

var isArray = Array.isArray;

var getType = {};
var isFunction = function(f) {
 return f && getType.toString.call(f) == '[object Function]';
};

var isObject = function(f) {
  return f && getType.toString.call(f) == '[object Object]';
};

var Symbol = function(v) {
  this.val = v;
};

Symbol.prototype.toString = function() {
  return this.val;
};

var str = function self(exp) {
  if (isArray(exp)) {
    return '(' + exp.map(self).join(' ') + ')';
  } else if (isFunction(exp)) {
    return exp.name || '[Function]';
  } else if (isa(exp, Symbol)) {
    return exp.val;
  } else {
    return exp;
  }
};

var isString = function(t) {

  if (!t.split) {
    return false;
  }

  var t = t.split('');

  return ('"' === t[0] && '"' === last(t));
};

var atom = function(token) {

  if (isString(token)) {
    return token;
  }

  if (isNaN(token)) {
    return new Symbol(token);
  }

  return parseFloat(token, 10);
};

var stripQuotes = function(s) {
  return (s.split && isString(s))
    ? s.split('').slice(1, s.length - 1).join('')
    : s;
};

var splitStr = function(a) {
  return (isString(a)) ? stripQuotes(a).split("") : a;
};

var arrMerge = function() {
  return [].concat.apply([], args(arguments));
};

String.prototype.repeat = function(num) {
    return new Array(num + 1).join(this);
};

var destructure = function ds(names, args) {

  var count = args.length
    , acc = {}
    , i = 0;

  var conj = function(k, v) {
    acc[k] = v;
  };

  var merge = function(c) {
    for (var i in c) {
      conj(i, c[i]);
    }
  };

  var loop = function(k, v, i) {

    if (isArray(k)) {
      merge(ds(k, v));
      delete names[i];
      return true;
    }

    var mk, mv;

    if (k == '&') {
      mk = names.slice(i + 1)[0];
      mv = args.slice(i);
      if (isArray(mk)) {
        merge(ds(mk, mv));
      } else {
        conj(mk, mv);
      }
      return false;
    }
    conj(k, v);
    return true;
  };

  for ( ; i < count; i++) {
    if (!loop(names[i], args[i], i)) {
      break;
    }
  }

  names.forEach(function(n) {
    if (typeof acc[n] === 'undefined' && n !== '&' && !isArray(n)) {
      acc[n] = '';
    }
  });

  return acc;
};

var error = function(type, message) {
  throw {
      type: type
    , message: message
  };
};

var specialSymbol = function(symbol, onopen, onclose) {

  return function recur(tokens) {
    var expanded = []
      , open = 0
      , current_length = 0
      , found = false
      , openQuote = function() {
          expanded = onopen(expanded);
          current_length = 0;
          found = true;
        }
      , closeQuote = function() {
          if (isFunction(onclose)) {
            expanded = onclose(expanded, current_length);
          }
          found = false;
          current_length = 0;
        };

    tokens.forEach(function(v, k) {

      if (v == symbol && !found) {
        openQuote();
        return;
      }

      expanded.push(v);
      current_length++;

      if (found) {
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

    if (found) {
      closeQuote();
    }

    return tokens.length == expanded.length ? expanded : recur(expanded);
  };
};

var expand = function(symbol, replacement) {
  return specialSymbol(
      symbol
    , function(tokens) {
        return tokens.concat('(', replacement);
      }
    , function(tokens) {
        tokens.push(')'); return tokens;
      }
  );
};

var objectToPairs = function(o) {
  var re = []
    , i;
  for (i in o) {
    re.push(i);
    re.push(o[i]);
  }
  return partition(re, 2);
};

exports.zipmap = zip;
exports.args = args;
exports.isArray = isArray;
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isString = isString;
exports.isa = isa;
exports.rest = rest;
exports.last = last;
exports.trim = trim;
exports.Symbol = Symbol;
exports.str = str;
exports.atom = atom;
exports.stripQuotes = stripQuotes;
exports.splitStr = splitStr;
exports.arrMerge = arrMerge;
exports.destructure = destructure;
exports.error = error;
exports.identity = identity;
exports.expand = expand;
exports.partition = partition;
exports.objectToPairs = objectToPairs;
