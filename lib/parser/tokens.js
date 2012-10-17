// tokens

var _ = require('./../utils.js')
  , expanders = require('./expanders.js').fns;

var expandForms = function(tokens) {
  for (var i in expanders) {
    tokens = expanders[i](tokens);
  }
  return tokens;
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
  return expandForms([].concat.apply([], tokenized));
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

exports.tokenize = tokenize;
exports.tokenizeLine = tokenizeLine;
exports.stripComments = stripComments;
exports.expandForms = expandForms;
exports.reader = reader;
exports.read = read;
