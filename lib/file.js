// files

var fs = require('fs')
  , _ = require('./utils.js')
  , lisp = require('./parser.js');

var parseFile = function(parser, str) {

  parser = parser || new lisp.Parser();

  var tokens = parser.tokenize(str.trim())
    , f = []
    , i = [];

  while (tokens.length) {
    i = parser.reader(tokens);
    f.push(i.found);
    tokens = i.rest;
  }

  f.forEach(function(form) {
    var evald = parser.e(form);
  });

  return parser;
};

var read = function(filename, parser, onopen) {

  parser = parser || new lisp.Parser();

  console.log('Loading file [' + filename + ']');

  parseFile(parser, fs.readFileSync(filename, 'utf8'));

  if (_.isFunction(onopen)) {
    onopen(parser);
  }

  return parser;
};

var load = function(files, parser, finish) {

  parser = parser || new lisp.Parser();

  files.forEach(function(f) {
    read(f, parser);
  });

  if (_.isFunction(finish)) {
    finish(parser);
  }

  return parser;
};

exports.read = read;
exports.parseFile = parseFile;
exports.load = load;
