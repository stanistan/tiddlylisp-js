// special forms / expanding in the reader

var _ = require('./../utils.js');

var expanders = [
    '\'', 'q'
  , '`', 'backquote'
  , ',', 'unquote'
  , '@', 'splice'
];

var makeFns = function(conf, prefix) {

  prefix = prefix || '';

  var re = {};

  _.partition(conf, 2).forEach(function(el) {
    re[prefix + el[1].split(' ').join('')] = _.expand(el[0], el[1]);
  });

  return re;
};

exports.configuration = expanders;
exports.fns = makeFns(expanders, 'expand_');
exports.makeExpanders = makeFns;
