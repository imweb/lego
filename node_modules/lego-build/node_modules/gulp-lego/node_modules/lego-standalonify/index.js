'use strict';

var through = require('through2');
var cmdclean = require('cmdclean');

module.exports = function(opts) {

  opts = opts || {};

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) return cb(null, file); // pass along

    var code = file.contents.toString();
    code = cmdclean(code, opts);

    file.contents = new Buffer(code);
    cb(null, file);
  });
};
