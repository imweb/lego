'use strict';

var fs = require('fs');
var semver = require('semver');
var path = require('path');
var join = path.join;
var exists = fs.existsSync;
var dirname = path.dirname;

exports.getVersion = getVersion;
exports.getBase = getBase;
exports.resolvePath = resolvePath;
exports.isRelative = isRelative;
exports.winPath = winPath;

function getVersion(version, dest) {
  if (!exists(dest)) return;

  var map = {};
  var dirs = fs.readdirSync(dest);
  var versions = dirs
    .filter(filterDir)
    .map(getPkgVersion)
    .filter(semver.valid)
    .sort(semver.rcompare);
  var ret = semver.maxSatisfying(versions, version);
  if (ret) {
    return {
      version: ret,
      dir: map[ret]
    };
  }

  // match reference for component
  // tag, branch, hash
  //  dirs.some(function(ver) {
  //    if (!semver.valid(ver) && ver === version) {
  //      ret = ver;
  //      return true;
  //    }
  //  });
  return ret;

  function getPkgVersion(dir) {
    var pkg = join(dest, dir, 'package.json');
    var ver = require(pkg).version;
    map[ver] = dir;
    return ver;
  }

  function filterDir(dir) {
    return fs.statSync(join(dest, dir)).isDirectory();
  }
}

function getBase(pkg) {
  while(pkg.father) {
    pkg = pkg.father;
  }
  return pkg.dest;
}

/*
  resolve a `relative` path base on `base` path
*/

function resolvePath(relative, base) {
  if (!isRelative(relative) || !base) return relative;
  relative = join(dirname(base), relative);
  if (isRelative(relative)) throw new Error(winPath(relative) + ' is out of bound');
  return relative;
}

/*
  Test filepath is relative path or not
*/

function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}

function winPath(path) {
  return path.replace(/\\/g, '/');
}
