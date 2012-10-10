// files

var fs = require('fs')
  , lisp = require('./parser.js');

// reading a file in lisp
var read = function(filename, parser, onopen) {

  parser = parser || new lisp.Parser();

  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
      throw err;
    }

    var tokens = parser.tokenize(data.trim())
      , f = []
      , i;

    while (tokens.length) {
      i = parser.reader(tokens);
      f.push(i.found);
      tokens = i.rest;
    }

    console.log('Loading file [' + filename + ']');

    f.forEach(function(form) {
      var evald = parser.e(form);
      if (evald != '[Function]' && evald) {
        console.log(evald);
      }
    });

    if (typeof onopen != 'undefined') {
      onopen(parser);
    }
  });
};

exports.read = read;
