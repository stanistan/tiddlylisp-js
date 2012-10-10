// repl

var lisp = require('./parser.js')
  , readline = require('readline')
  , file = require('./file.js');

var start = function(pr, parser) {

  parser = parser || new lisp.Parser();
  pr = pr || '=> ';

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  var prompt = function() {
    rl.setPrompt(pr, pr.length);
    rl.prompt();
  };

  var line = function(cmd) {
    cmd = cmd.trim();
    if (!!cmd.length) {
      console.log(parser.parse(cmd));
    }
    prompt();
  };

  var close = function() {
    console.log('\nLater, y\'all.');
    process.exit(0);
  };

  var except = function(e) {
    console.log(e.stack || e);
    prompt();
  };

  console.log('Wecome to tiddly lisp in JS!');
  prompt();

  rl.on('line', line).on('close', close);

  process.on('uncaughtException', except);
};

exports.init = start;
