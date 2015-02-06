'use strict';

var util = require('../util');
var requires = require('searequire');
var format = require('util').format;
var through = require('through2');
var rename = require('rename');
var join = require('path').join;
var relative = require('path').relative;
var dirname = require('path').dirname;
var exists = require('fs').existsSync;
var lstat = require('fs').lstatSync;

module.exports = function jsParser(options) {
  return through.obj(function(file) {
    file = parser(file, options);
    this.push(file);
  });
};

function parser(file, options) {
  file.contents = new Buffer(transportFile(file, options));

  var id = file.url.pathname.substring(1);
  // if (options.isEntry) {
  //   id = util.template('{{name}}/{{version}}/{{filepath}}', {
  //     name: pkg.name,
  //     version: pkg.version,
  //     filepath: path.relative(options.root, file.path)
  //   });
  // }
  // if (!options.url || id !== options.url.pathname.slice(1)) {
  //   id = '';
  // }

  file.contents = new Buffer(util.define(id, file.contents));
  return file;
}

function transportFile(file, options) {
  return requires(file.contents.toString(), function(item) {
    var dep = item.path.toLowerCase();

    if (util.isRelative(dep)) {
      if (util.isCSSFile(dep)) {
        return format('require("%s")', rename(dep, {extname:'.css'}));
      }
      var dir = dirname(file.path);
      var newfile = relative(dir, getFile(join(dir, item.path)));
      if (newfile.charAt(0) !== '.') {
        newfile = './' + newfile;
      }
      return format('require("%s")', newfile);

    } else {
      var arr = dep.split('/');
      dep = arr.shift();

      if (options.ignore.indexOf(dep) > -1) {
        return item.string;
      }

      var p = (options.pkg.dependencies && options.pkg.dependencies[dep]) ||
        (options.pkg.devDependencies && options.pkg.devDependencies[dep]);
      if (!p) return item.string;

      var main = p.main;
      // is require pkg file
      if (arr.length > 0) {
        main = arr.join('/');
      }

      main = relative(p.dest, getFile(join(p.dest, main)));
      return format('require("%s/%s/%s")',
        p.name, p.version, main);
    }
  });
}

function getFile(file) {
  if (!exists(file) && !exists(file + '.js')) {
    return file;
  }
  // is file
  if (exists(file) && lstat(file).isFile()) {
    return file;
  }
  if (exists(file + '.js') && lstat(file + '.js').isFile()) {
    return file;
  }
  // is directory
  if (lstat(file).isDirectory()) {
    return join(file, 'index.js');
  }

  return file;
}
