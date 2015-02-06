'use strict';

var common = require('../common');
var css2str = require('css2str');
var createStream = common.createStream;
var getStyleId = common.getStyleId;
var debug = require('debug')('transport:css2js');

module.exports = function css2jsParser(options) {
  return createStream(options, 'css', parser);
};

function parser(gfile, options) {
  var code = 'require(\'import-style\')(\'' + css2js(gfile, options) + '\');\n';
  gfile.contents = new Buffer(code);
  gfile.path += '.js';
  return gfile;
}

function css2js(gfile, options) {
  var opt;
  if (options.styleBox === true) {
    var file = gfile.file;
    var styleId = getStyleId(file, options);
    var prefix = ['.', styleId, ' '].join('');
    debug('styleBox true, prefix: %s', prefix);
    opt = {prefix: prefix};
  }
  return css2str(gfile.contents, opt);
}
