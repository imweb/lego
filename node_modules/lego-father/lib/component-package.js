'use strict';

var path = require('path');
var join = path.join;
var util = require('./util');
var Package = require('./package');
var debug = require('debug')('father:component');

var ComponentPackage = Package.extend({

  readPackage: function() {
    var pkgFile = normalize(join(this.dest, 'component.json'));
    debug('readPackage(%s) info %s', pkgFile.id, JSON.stringify(pkgFile));

    Object.keys(pkgFile.dependencies)
      .forEach(function(name) {
        var dpkgFile = resolveDeps(name, pkgFile, this);
        delete pkgFile.dependencies[name];
        pkgFile.dependencies[dpkgFile.name] = dpkgFile;
      }.bind(this));
    return pkgFile;
  }

});

module.exports = ComponentPackage;

function normalize(pkg) {
  var dest = path.dirname(pkg);
  delete require.cache[require.resolve(pkg)];
  pkg = require(pkg);
  var scripts = pkg.scripts || [];
  var styles = pkg.styles || [];
  var ret = {
    id: pkg.name + '@' + pkg.version,
    name: pkg.name,
    version: pkg.version,
    dependencies: pkg.dependencies || {},
    main: pkg.main || 'index.js',
    dest: dest,
    output: scripts.concat(styles),
    origin: pkg
  };
  return ret;
}

function resolveDeps(name, pkgFile, pkg) {
  var base = util.getBase(pkg);
  var dest = join(base, 'components', name);
  var version = util.getVersion(pkgFile.dependencies[name], dest);
  if (!version) {
    throw new Error('no matched version of ' + name);
  }
  var dpkg = normalize(join(dest, version, 'component.json'));
  return {
    id: dpkg.name + '@' + dpkg.version,
    name: dpkg.name,
    version: dpkg.version,
    dest: join(dest, version)
  };
}

