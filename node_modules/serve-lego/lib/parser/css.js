'use strict';

var util = require('../util');
var imports = require('css-imports');
var format = require('util').format;
var through = require('through2');
var path = require('path');

module.exports = function cssParser(options) {
  return through.obj(function(file) {
    file = parser(file, options);
    this.push(file);
  });
};

function parser(file, options) {
  file.contents = new Buffer(transportFile(file, options.pkg));
  return file;
}

function transportFile(file, pkg) {
  var prefix = '';
  if (file.url) {
    prefix = new Array(file.url.pathname.slice('1').split('/').length).join('../');
  }

  return imports(file.contents, function(item) {
    var dep = item.path;

    if (!util.isRelative(dep)) {
      var arr = dep.split('/');
      dep = arr.shift();

      var p = (pkg.dependencies && pkg.dependencies[dep]) ||
        (pkg.devDependencies && pkg.devDependencies[dep]);
      if (!p) return item.string;

      var main = p.main;
      // is require pkg file
      if (arr.length > 0) {
        main = arr.join('/');
      }
      return format('@import "%s%s/%s/%s";', prefix, p.name, p.version, main);
    } else {
      return item.string;
    }
  });
}
