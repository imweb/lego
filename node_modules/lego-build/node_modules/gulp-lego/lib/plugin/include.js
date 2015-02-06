'use strict';

var fs = require('fs');
var File = require('vinyl');
var through = require('through2');
var util = require('../util');
var extendOption = util.extendOption;
var common = require('../common');
var getExtra = common.getExtra;
var debug = require('debug')('transport:include');

module.exports = function(opt) {
  opt = extendOption(opt);

  return through.obj(function(gfile, enc, cb) {
    if (gfile.isNull()) return cb(null, gfile);
    if (gfile.isStream()) return cb(new Error('Streaming not supported.'));

    var self = this;
    var base = gfile.base;
    var pkg = opt.pkg;

    var endFile = gfile.clone();
    endFile.dependentPath = gfile.path;
    endFile.contents = null;

    var files;
    try {
      files = getFiles(gfile.file, opt);
    } catch(e) {
      return cb(e);
    }

    // file self
    debug('filepath:%s self', gfile.path);
    this.push(gfile);

    // file dependency
    files.forEach(function(filepath) {
      var f = createFile(filepath, base);
      f.file = pkg.getFile(filepath) || null;
      f.dependentPath = gfile.path;
      debug('filepath:%s dependency', f.path);
      self.push(f);
    });

    // end file
    debug('filepath:%s end', endFile.path);
    this.push(endFile);
    cb();
  });
};

function getFiles(file, options) {
  var pkg = file.pkg;
  var include = options.include || 'relative';
  if (include === 'standalone' || include === 'umd') {
    include = 'all';
  }

  var extra = getExtra(file, pkg, options);
  return file.lookup(function(fileInfo) {
    var dependent = fileInfo.dependent;

    if (fileInfo.ignore) {
      return false;
    }

    // css hack
    if (fileInfo.extension === 'css') {
      // ignore when css -> css
      if (dependent.extension === 'css') return false;
      // ignore when js -> css and js is not self
      if (include !== 'all' && dependent.extension === 'js' && !isSelf(dependent.pkg)) return false;

      return fileInfo.path;
    }

    // just self, no dependencies
    if (include === 'self') {
      return false;
    }

    // include relative file in package
    if (include === 'relative' && pkg.name !== fileInfo.pkg.name) {
      return false;
    }

    return fileInfo.path;
  }, extra);

  function isSelf(pkg_) {
    return pkg_.name === pkg.name;
  }
}

function createFile(filepath, base) {
  return new File({
    cwd: base,
    base: base,
    path: filepath,
    contents: fs.readFileSync(filepath)
  });
}
