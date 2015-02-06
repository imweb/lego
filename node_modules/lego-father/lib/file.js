'use strict';

var fs = require('fs');
var path = require('path');
var Vinyl = require('vinyl');
var join = path.join;
var relative = path.relative;
var extname = path.extname;
var debug = require('debug')('father:file');

module.exports = File;

File.require = function requireFile(src, pkg) {
  var cache = pkg._files;
  src = tryFile(src, pkg.dest);
  var fullpath = join(pkg.dest, src);
  if (fullpath in cache) {
    debug('found %s in cache', fullpath);
    return cache[fullpath];
  }
  var file = new File({
    path: join(pkg.dest, src),
    pkg: pkg
  });
  debug('save %s in cache', file.path);
  return cache[file.path] = file;
};

File.ignore = function ignoreFile(name) {
  var file = new File({
    pkg: {
      id: name,
      name: name
    }
  });
  file.ignore = true;
  return file;
};

function File(file) {
  file = normalize(file);
  Vinyl.call(this, file);
  this.pkg = file.pkg;
  this.extension = file.extension || '';
  this._dependencies = {};
}

File.prototype = Object.create(Vinyl.prototype);

File.prototype.lookup = function(cb, extra) {
  var deps = this._run().concat(extra || []);

  return deps.map(function(obj) {
    return cb(obj);
  }).filter(function(item, index, arr) {
    return item && index === arr.indexOf(item);
  });
};

File.prototype.hasExt = function(ext, filter) {
  var deps = this._run();

  return deps.some(function(obj) {
    if (filter && !filter(obj)) return false;
    return obj.extension === ext;
  });
};

File.prototype.addDeps = function(id, file) {
  if (!(id in this._dependencies)) {
    this._dependencies[id] = file;
  }
};

File.prototype.getDeps = function(id) {
  return this._dependencies[id];
};

File.prototype._run = function() {
  if (this.cache) return this.cache;

  var that = this, cache = [];
  Object.keys(this._dependencies).forEach(function(key) {
    var file = this._dependencies[key];
    if (file.ignore) {
      cache.push({
        ignore: true,
        pkg: file.pkg
      });
    } else {
      cache.push({
        ignore: false,
        pkg: file.pkg,
        base: file.base,
        path: file.path,
        history: file.history,
        relative: file.relative,
        isRelative: that.pkg.name === file.pkg.name,
        dependent: that,
        extension: file.extension
      });
      cache = cache.concat(file._run());
    }
  }, this);

  return this.cache = cache;
};

Object.defineProperty(File.prototype, 'dependencies', {
  get: function() {
    return Object.keys(this._dependencies).map(function(key) {
      var file = this._dependencies[key];
      if (file.ignore) {
        return file.pkg.name;
      }
      if (this.pkg.name !== file.pkg.name) {
        return file.pkg.name + (file.pkg.main !== file.relative ? '/' + file.relative : '');
      }
      file = path.relative(path.dirname(this.relative), file.relative);
      return file.charAt(0) === '.' ? file : './' + file;
    }, this);
  }
});

function normalize(file) {
  if (!file || !file.pkg) throw new Error('file.path and file.pkg should exist');
  file.base = file.pkg.dest;
  if (file.path) {
    file.stat = fs.lstatSync(file.path);
    file.contents = fs.readFileSync(file.path);
    file.extension = extname(file.path).substring(1);
  }
  return file;
}

function tryFile(src, cwd) {
  var fileArray = [src];
  if (!/\.js$/.test(src)) {
    fileArray.push(src + '.js');
  }
  if (!extname(src)) {
    fileArray.push(src + '.json');
    fileArray.push(join(src, 'index.js'));
  }

  for (var i in fileArray) {
    var file = join(cwd, fileArray[i]);
    try {
      var stat = fs.statSync(file);
      if (stat.isFile()) {
        return fileArray[i];
      }
    } catch(e) {}
  }

  src = relative(process.cwd(), join(cwd, src));
  debug('%s not found', src);
  throw new Error(src + ' not found');
}
