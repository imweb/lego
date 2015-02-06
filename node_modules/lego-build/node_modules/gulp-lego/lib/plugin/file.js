'use strict';

var through = require('through2');

module.exports = function file(pkg) {
  return through.obj(function(gfile, enc, cb) {
    if (gfile.isNull()) return cb(null, gfile);
    if (gfile.isStream()) return cb(new Error('Streaming not supported.'));

    var file = pkg.getFile(gfile.path);
    gfile.file = file || null;
    gfile.base = file ? file.pkg.dest : gfile.base;
    cb(null, gfile);
  });
};
