'use strict';

var through = require('through2');
var extendOption = require('../util').extendOption;
var debug = require('debug')('transport:concat');

module.exports = function(opt) {
  opt = extendOption(opt);

  var fileCache;
  var bufCache;

  return through.obj(function(gfile, enc, cb) {

    if (isStart(gfile)) {
      debug('filepath:%s start', gfile.path);
      fileCache = gfile;
      bufCache = gfile.contents.toString();
      return cb();
    }

    if (isEnd(gfile)) {
      debug('filepath:%s end', gfile.path);
      fileCache.contents = new Buffer(bufCache);
      this.push(fileCache);
      fileCache = null;
      bufCache = null;
      return cb();
    }

    debug('filepath:%s with dependentPath %s', gfile.path, gfile.dependentPath);
    bufCache += gfile.contents.toString();
    cb();
  });
};

function isStart(gfile) {
  return !gfile.dependentPath;
}

function isEnd(gfile) {
  return gfile.dependentPath &&
    (gfile.dependentPath === gfile.path || gfile.dependentPath === gfile.history[0]);
}
