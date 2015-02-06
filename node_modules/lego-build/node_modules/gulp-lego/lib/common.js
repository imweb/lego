'use strict';

var path = require('path');
var join = path.join;
var extname = path.extname;
var through = require('through2');
var debug = require('debug')('transport:util');

var util = require('./util');
var template = util.template;
var extendOption = util.extendOption;
var hideExt = util.hideExt;
var rename = util.rename;
var winPath = util.winPath;
var throwError = util.throwError;

/*
  exports
*/

exports.transportId = transportId;
exports.transportDeps = transportDeps;
exports.createStream = createStream;
exports.getStyleId = getStyleId;
exports.getExtra = getExtra;
exports.resolveIdleading = resolveIdleading;

/*
  Transport cmd id

  - file: file object of father
  - required options: idleading, rename
*/

function transportId(file, options) {
  if (!(file.pkg && file.path)) {
    throwError('should pass file object of father when transportId `%s`', file);
  }

  options = extendOption(options);

  var pkg = file.pkg;
  var idleading = resolveIdleading(options.idleading, file.path, pkg);
  var prefix = template(idleading, pkg);

  var fullpath = rename(file, options);
  var filepath = path.relative(pkg.dest, fullpath);
  filepath = hideExt(filepath);

  // seajs has hacked css before 3.0.0
  // https://github.com/seajs/seajs/blob/2.2.1/src/util-path.js#L49
  // demo https://github.com/popomore/seajs-test/tree/master/css-deps
  if (extname(filepath) === '.css') {
    filepath += '.js';
  }

  var id = winPath(join(prefix, filepath));
  debug('transport id(%s) of pakcage %s', id, pkg.id);
  return id;
}

/*
  Transport cmd dependencies, it will get deep dependencies of the file,
  but will ignore relative module of the dependent package.

  - file: file object of father
  - required options: idleading, rename, ignore
*/

function transportDeps(file, options) {
  if (!(file && file.pkg && file.path)) {
    throwError('should pass file object of father when transportDeps `%s`', file);
  }

  options = extendOption(options);
  var deps, pkg = file.pkg;
  var include = options.include;
  var extra = getExtra(file, pkg, options);

  // only return ignore package when include = all
  if (include === 'all') {
    deps = file.lookup(function(fileInfo) {
      var pkg = fileInfo.pkg;
      return !fileInfo.isRelative && (fileInfo.ignore ? pkg.name : false);
    });
  } else {
    deps = file.lookup(function(fileInfo) {
      var pkg = fileInfo.pkg;
      var isRelative = fileInfo.isRelative;

      // don't transport ignore package
      if (fileInfo.ignore) {
        return pkg.name;
      }

      // needn't contain css
      if (fileInfo.extension === 'css') {
        return false;
      }

      // relative file need transport only when self
      if (isSelf(pkg) && include !== 'self') {
        return false;
      }

      // package dependencies
      if (!isSelf(pkg)) {
        // ignore relative file in package of dependencies
        if (isRelative) return false;
      }

      return transportId(fileInfo, options);
    }, extra);
  }

  debug('transport deps(%s) of pakcage %s, include: %s', deps, pkg.id, include);
  return deps;

  // test if pkg is self
  function isSelf(pkg_) {
    return pkg_.name === pkg.name;
  }
}

/*
  Create a stream for parser in lib/parser
*/

function createStream(options, type, parser) {
  options = extendOption(options);
  if (!options.pkg) {
    throwError('pkg missing');
  }

  return through.obj(function(gfile, enc, callback) {
    if (gfile.isNull()) {
      debug('transport ignore filepath:%s cause null', gfile.path);
      return callback(null, gfile);
    }

    if (gfile.isStream()) return callback(new Error('Streaming not supported.'));

    var ext = extname(gfile.path).substring(1);
    if (type && ext !== type) {
      return callback(new Error('extension "' + ext + '" not supported.'));
    }

    try {
      debug('transport %s / filepath:%s', type, gfile.path);
      gfile = parser(gfile, options);
    } catch(e) {
      return callback(e);
    }

    this.push(gfile);
    return callback();
  });
}

function getStyleId(file, options) {
  var idleading = resolveIdleading(
    options.idleading,
    file.relative,
    file.pkg
  );
  return template(idleading, file.pkg)
    .replace(/\\/g, '/')
    .replace(/\/$/, '')
    .replace(/\//g, '-')
    .replace(/\./g, '_');
}

function isFunction(fun) {
  return Object.prototype.toString.call(fun) === '[object Function]';
}

function resolveIdleading(idleading, filepath, pkg) {
  return isFunction(idleading) ?
    idleading(filepath, pkg) : idleading;
}

/*
  Get extra fileInfo for file.lookup
  see https://github.com/popomore/father#file-object
*/

var extraDeps = exports.extraDeps = {
  'handlebars': 'handlebars-runtime',
  'css': 'import-style'
};

function getExtra(file, pkg, options) {
  var ret = [];
  Object.keys(extraDeps).filter(function(ext) {
    return hasExt(file, ext);
  }).forEach(function(ext) {
    var name = extraDeps[ext];
    var extraPkg = options.pkg.dependencies[name];
    if (!extraPkg) {
      throwError('%s is not configured in package.json, but .%s is required', name, ext);
    }

    // extra package
    var deps = {};
    deps[name] = extraPkg;
    pkg.dependencies = deps;

    var extraFile = extraPkg.files[extraPkg.main];
    extraFile.ignore = options.ignore.indexOf(name) > -1;

    ret.push({
      ignore: extraFile.ignore,
      pkg: extraPkg,
      relative: extraPkg.main,
      path: join(extraPkg.dest, extraPkg.main),
      history: [join(extraPkg.dest, extraPkg.main)],
      isRelative: false,
      extension: extname(extraPkg.main).substring(1)
    });
    ret = ret.concat(extraPkg.files[extraPkg.main]._run());
  });
  return ret;

  function hasExt(file, ext) {
    if (file.extension === ext) return true;

    var deps = file._run();
    for (var i in deps) {
      var fileInfo = deps[i];
      if (fileInfo.extension !== ext ) continue;

      if (ext !== 'css') return true;

      if (ext === 'css') {
        // ignore css file except for required by js
        if (fileInfo.dependent.extension === 'js') return true;
      }
    }
    return false;
  }
}
