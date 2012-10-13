// main

var lisp = require('./lib/parser.js')
  , file = require('./lib/file.js')
  , repl = require('./lib/repl.js');

var parser = new lisp.Parser();

// read core
file.read('./lisp/core.lisp', parser, function() {

  file.load(process.argv.slice(2), parser, function() {
    repl.init('=> ', parser);
  });

});
