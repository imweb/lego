'use strict';

var strip = require('strip-comments');
var through = require('through2');
var util = require('../util');

module.exports = function css2jsParser() {
  return through.obj(function(file) {
    file = parser(file);
    this.push(file);
  });
};

function parser(file) {
  var id = file.url.pathname.substring(1);
  var code = file.contents.toString();
  code = css2js(code);
  code = util.define(id, 'seajs.importStyle(\''+code+'\');');
  file.contents = new Buffer(code);
  return file;
}

function css2js(code) {
  return strip
    .block(code)
    .replace(/\n|\r/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '"');
}
