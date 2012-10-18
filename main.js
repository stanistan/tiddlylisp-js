// main

var lisp = require('./lib/parser.js')
  , file = require('./lib/file.js')
  , repl = require('./lib/repl.js');

var parser = new lisp.Parser()
  , args = process.argv.slice(2)
  , files = []
  , flags = [];

args.forEach(function(a) {
  (a.indexOf('-') === 0 ? flags : files).push(a);
});


try {
  // read core
  file.read('./lisp/core.lisp', parser, function() {

    file.load(files, parser, function() {
      if (flags.indexOf('-r') < 0) {
        repl.init('=> ', parser);
      }
    });

  });

} catch (e) {
  console.log(e);
}
