// main

var lisp = require('./lib/parser.js')
  , file = require('./lib/file.js')
  , repl = require('./lib/repl.js');

var parser = new lisp.Parser();

// read core
file.read('./lisp/core.lisp', parser, function() {

  var files = process.argv.slice(2)
    , num_files = files.length
    , counter = 0
    , checker
    , interval;

  files.forEach(function(f) {
    file.read(f, parser, function() {
      counter++
    });
  });

  checker = function() {
    if (counter >= num_files) {
      clearInterval(interval);
      repl.init('=> ', parser);
    }
  };

  interval = setInterval(checker, 10);
});
