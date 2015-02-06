'use strict';

var fs = require('fs');
var path = require('path');
var imports = require('css-imports');
var debug = require('debug')('transport:css');
var util = require('../util');
var rename = util.rename;
var throwError = util.throwError;
var createStream = require('../common').createStream;
var join = path.join;
var dirname = path.dirname;

module.exports = function cssParser(options) {
  return createStream(options, 'css', parser);
};

function parser(gfile, options) {
  var imported = {}, depPkgs = {};

  gfile.contents = new Buffer(transportFile(gfile.file));
  //replace filename with suffix
  gfile.path = rename(gfile, options);
  return gfile;

  function transportFile(file) {
    imported[file.path] = true;
    var contents = fs.readFileSync(file.path);

    return imports(contents, function(item) {
      var dep = item.path, depFile;

      if (util.isRelative(dep)) {
        var depFilepath = join(dirname(file.relative), dep);
        depFile = file.pkg.files[depFilepath];
      } else {
        depFile = file.getDeps(dep);
        var depPkg = depFile.pkg;

        if (depFile.ignore) {
          return '';
        }

        // throw when css conflict
        var oldVersion = depPkgs[depPkg.name];
        if (oldVersion && oldVersion !== depPkg.version) {
          throwError('%s conflict with %s', depPkg.id, depPkg.name + '@' + oldVersion);
        } else {
          depPkgs[depPkg.name] = depPkg.version;
        }
      }

      // only import once
      if (imported[depFile.path]) {
        return '';
      }

      debug('from %s import %s', file.path, depFile.path);
      return transportFile(depFile);
    }).replace(/\n{2,}/g, '\n\n');
  }
}
