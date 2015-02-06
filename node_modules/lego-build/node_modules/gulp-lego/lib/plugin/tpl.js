'use strict';

var createStream = require('../common').createStream;

exports.tpl = function tplParser(options) {
  return createStream(options, 'tpl', function(gfile) {
    return parse(gfile);
  });
};

exports.html = function tplParser(options) {
  return createStream(options, 'html', function(gfile) {
    return parse(gfile);
  });
};

function parse(gfile) {
  var code = gfile
  .contents
  .toString()
  .replace(/\n|\r/g, '')
  .replace(/'/g, '\\\'');

  gfile.contents = new Buffer('module.exports = \'' + code + '\';\n');
  gfile.path += '.js';
  return gfile;
}
