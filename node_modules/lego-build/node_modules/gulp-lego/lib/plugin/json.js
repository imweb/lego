'use strict';

var createStream = require('../common').createStream;

module.exports = function jsonParser(options) {
  return createStream(options, 'json', parser);
};

function parser(gfile) {
  gfile.contents = new Buffer('module.exports = ' + clean(gfile) + ';\n');
  gfile.path += '.js';
  return gfile;
}

function clean(gfile) {
  var code = gfile.contents.toString();
  return JSON.stringify(JSON.parse(code));
}
