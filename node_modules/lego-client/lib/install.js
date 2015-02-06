'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var color = require('lego-colorful');
var mkdirp = require('mkdirp');
var extend = require('extend');
var legorc = require('legorc');
var log = require('lego-log');
var vfs = require('vinyl-fs');
var gunzip = require('gulp-gunzip');
var untar = require('gulp-untar2');
var pipe = require('multipipe');
var format = require('util').format;
var util = require('./util');
var info = require('./info');
var request = require('request');
var debug = require('debug')('lego-client:install');
var getVersion = require('lego-father/lib/util').getVersion;

var defaults = {
  cwd: process.cwd(),
  destination: legorc.get('install.path')
};

install.installPackage = installPackage;
module.exports = install;

/*
  install(args, config)

  *args
    * name: the package name, can also be name@version
    * cwd: the dependencies of the package in the cwd will be installed, use it when name isn't specified
    * destination: the directory that install to
    * force: force download packages from registry, no cache
    * save: save name to package.dependencies
    * saveDev: save name to package.devDependencies
  * config: see client.config
*/

function* install(args, config) {
  args = extend({}, require('./config')(), config, defaults, args);
  args.cwd = path.resolve(args.cwd);
  args.destination = path.join(args.cwd, args.destination);
  args.downloadlist = {};

  var packages;

  // lego install id@version
  if (args.name) {
    packages = Array.isArray(args.name) ? args.name : [args.name];
  }

  // lego install
  else {
    args.save = false;
    args.saveDev = false;
    var pkgPath = path.join(args.cwd, 'package.json');
    packages = parseDependencies(pkgPath, true);
  }

  // no package to be installed
  if (!packages.length) return;

  debug('install packages %s', packages.join(', '));
  yield packages.map(function(id) {
    return install.installPackage(id, args, true);
  });
}

/* Install a package.
 *
 * The process of the installation:
 *
 *  1. Find and download the package from yuan or cache
 *  2. Copy the files to `sea-modules/{name}/{version}/{file}
 */

function* installPackage(id, args, saveDeps) {
  delete args.name;
  var idObj = util.resolveid(id);
  idObj.version = idObj.version || 'stable';
  var pkgId = idObj.name + '@' + (idObj.version);
  log.info('install', color.magenta(pkgId));
  debug('start install package %s', pkgId);

  // The package has downloaded in dest
  // always false when version is not empty
  if (existInDest(idObj, args)) return;

  // Fetch pkg info from registry
  var pinfo = yield* info(idObj, args);
  pkgId = pinfo.name + '@' + pinfo.version;

  // The package has been in downloadlist
  if (pkgId in args.downloadlist) {
    debug('package %s has been in downloadlist', pkgId);
    return;
  }

  args.downloadlist[pkgId] = pinfo;

  // save dependencies to package.json
  if ((args.save || args.saveDev) && saveDeps) {
    save(pinfo, args);
  }

  // The package has downloaded in dest
  if (existInDest(pinfo, args)) return;

  var dest = path.join(args.destination, pinfo.name, pinfo.version);
  var filename = pinfo.filename || pinfo.name + '-' + pinfo.version + '.tar.gz';
  var fileInCache = path.join(args.cache, filename);
  var fileInRemote = format('%s/repository/%s/%s/%s',
    args.registry, pinfo.name, pinfo.version, filename);
  var cacheIsExists = fs.existsSync(fileInCache);

  // download from remote when
  // 1. force install
  // 2. cache not exists
  // 3. cache file is old
  if (args.force || !(cacheIsExists && md5file(fileInCache) === pinfo.md5)) {
    debug('cache exists: %s', cacheIsExists);
    yield download(fileInRemote, fileInCache);
  }

  // extract from cache
  yield extract(fileInCache, dest);

  log.info('installed', color.green(dest));
  debug('end install package %s', pkgId);

  var packages = parseDependencies(pinfo);
  if (!packages.length) return;

  log.info('depends', packages.join(', '));
  debug('install dependencies %s of packages(%s)', packages.join(', '), pkgId);
  yield packages.map(function(id) {
    return installPackage(id, args);
  });
}

function existInDest(idObj, args) {
  if (!idObj.version) {
    return false;
  }

  var pkgId = format('%s@%s', idObj.name, idObj.version);
  var dest = path.join(args.destination, idObj.name);

  var ver;
  try {
    ver = getVersion(idObj.version, dest);
  } catch(e) {}

  if (!args.force && ver) {
    log.info('found', pkgId);
    debug('package %s found in %s', pkgId, dest);
    if (!args.downloadlist[pkgId]) args.downloadlist[pkgId] = idObj;
    return true;
  }
}

function download(urlpath, dest) {
  return function(callback) {
    log.info('download', urlpath);
    debug('download from %s to %s', urlpath, dest);
    mkdirp.sync(path.dirname(dest));
    request(urlpath)
    .once('error', callback)
    .once('end', callback)
    .once('close', callback)
    .pipe(fs.createWriteStream(dest));
  };
}

function extract(src, dest) {
  return function(callback) {
    log.info('extract', src);
    debug('extract package from %s to %s', src, dest);
    pipe(
      vfs.src(src),
      gunzip(),
      untar(),
      vfs.dest(dest)
    )
    .once('error', callback)
    .once('end', callback)
    .resume();
  };
}

function parseDependencies(pkg, includeDev) {
  if (typeof pkg === 'string') {
    pkg = readJSON(pkg);
  }

  var lego = pkg.lego || {};
  var deps = extend({},
    includeDev ? lego.engines : {},
    includeDev ? lego.devDependencies : {},
    lego.dependencies);

  return Object.keys(deps).map(function(key) {
    return key + '@' + deps[key];
  });
}

function save(idObj, args) {
  var pkgPath = path.join(args.cwd, 'package.json');
  var pkg = readJSON(pkgPath);
  var key = args.save ? 'dependencies' : 'devDependencies';

  log.info('saved', 'in', key, idObj.name + '@' + idObj.version);
  pkg.lego = pkg.lego || {};
  pkg.lego[key] = pkg.lego[key] || {};
  pkg.lego[key][idObj.name] = idObj.version;

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

function md5file(fpath) {
  var md5 = crypto.createHash('md5');
  return md5.update(fs.readFileSync(fpath)).digest('hex');
}

function readJSON(filepath) {
  var code = fs.readFileSync(filepath).toString();
  return JSON.parse(code);
}
