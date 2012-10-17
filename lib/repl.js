// repl

var lisp = require('./parser.js')
  , readline = require('readline')
  , file = require('./file.js');

var start = function(pr, parser) {

  parser = parser || new lisp.Parser();
  pr = pr || '=> ';

  var cl = []
    , rl = readline.createInterface({
          input: process.stdin
        , output: process.stdout
        , terminal: true
      })
    , prompt = function(p) {
        var text = p || pr;
        rl.setPrompt(text, text.length);
        rl.prompt();
      }
    , line = function(cmd) {

        cmd = cmd.trim();

         var c = cl.concat(cmd)
          , exec = c.join(' ').trim()
          , more = function() {
              prompt('...' + '..'.repeat(cl.length) + ' ');
            }
          , response
          , doPrompt = function() {
            !!cl.length ? more() : prompt();
          };

        try {
          if (!!cmd.length) {
            console.log(parser.parse(exec));
            cl = [];
          }
          doPrompt();
        } catch (e) {
          if (e.type == 'eof') {
            cmd.length && cl.push(cmd);
            doPrompt();
          } else {
            throw e;
          }
        }
      }
    , close = function() {
        console.log('\nLater, y\'all.');
        process.exit(0);
      }
    , except = function(e) {
        cl = [];
        console.log(e.stack || e);
        prompt();
      };

  console.log('Wecome to tiddly lisp in JS!');
  prompt();

  rl.on('line', line)
    .on('close', close);

  process.on('uncaughtException', except);

};

exports.init = start;
