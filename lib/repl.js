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

  var prompt = function(p) {
    var text = p || pr;
    rl.setPrompt(text, text.length);
    rl.prompt();
  };

  var cl = [];

  var line = function(cmd) {

    cmd = cmd.trim();

    var c = cl.concat(cmd)
      , exec = c.join(' ').trim()
      , more = function() {
          cmd.length && cl.push(cmd);
          prompt('...' + '..'.repeat(cl.length) + ' ');
        }
      , response
      , doPrompt = function() {
        !!cl.length ? more() : prompt();
      };

    try {

      if (!!cmd.length) {
        response = parser.parse(exec);
        console.log(response);
        cl = [];
      }

      doPrompt();

    } catch (e) {

      if (e.type == 'eof') {
        doPrompt();
      } else {
        throw e;
      }

    }
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
