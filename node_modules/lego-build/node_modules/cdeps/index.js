'use strict';

var resolve = require('path').resolve;
var dirname = require('path').dirname;
var exists = require('fs').existsSync;
var readFile = require('fs').readFileSync;
var debug = require('debug')('cdeps');
var crequire = require('crequire');
var imports = require('css-imports');

module.exports = function(entry) {
  return parse(entry);
};

/**
 * Parse file recursively and get module deps.
 * @param entry {String}
 * @returns {Array}
 */
function parse(entry) {
  debug('parse()', entry)
  var deps = [];

  var f = getFile(entry);
  if (!f) return [];
  debug('  getFile()', f);
  var _deps = parseDeps(f);
  debug('  _deps: ', _deps.join(', '));
  _deps.forEach(function(dep) {
    if (isRelative(dep)) {
      var nextDep = resolve(dirname(f), dep);
      deps = deps.concat(parse(nextDep));
    } else {
      // split dep for pkg file require
      // eg. `require('a/b')`
      deps.push(dep.split('/')[0]);
    }
  });

  return deps;
}

/**
 * Get deps of a file.
 * @param f {String} file
 * @returns {Array}
 */
function parseDeps(f) {
  function getPath(o) {
    return o.path;
  }

  var content = readFile(f, 'utf-8');
  if (endWith(f, '.js')) {
    return crequire(content).map(getPath);
  }
  if (endWith(f, '.css')) {
    return imports(content).map(getPath);
  }
}

/**
 * Test and return the corrent file.
 * @param f {String}
 * @returns {String}
 */
function getFile(f) {
  // 1. end with .js or .css and exists, return file
  // 2. not end with .js
  // 2.1 add .js and exists, return file
  // 2.2 add /index.js and exists, return file
  // null

  if (endWith(f, '.js') || endWith(f, '.css') && exists(f)) return f;
  if (!endWith(f, '.js')) {
    if (exists(f + '.js')) return f + '.js';
    if (exists(f + '/index.js')) return f + '/index.js';
  }

  return null;
}

function endWith(f, str) {
  return f.slice(-str.length).toLowerCase() === str.toLowerCase();
}

function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}
