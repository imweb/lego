'use strict';

var path = require('path');
var legorc = require('legorc');
var debug = require('debug')('lego-client:config');
var keys = Object.keys;

var _config, defaults = {
  // registry url of yuan server
  registry: legorc.get('registry'),
  // global registry, others are private
  global_registry: 'http://legojs.io',
  // an HTTP proxy, pass to request
  proxy: legorc.get('proxy'),
  // the authKey that copied from legojs accout page
  auth: legorc.get('auth'),
  // the temp directory
  temp: legorc.get('user.temp'),
  // cache directory
  cache: path.join(legorc.get('user.home'), '.lego', 'cache')
};

module.exports = config;
module.exports.reset = reset;

// reset _config first
reset();

function config(obj) {
  if (!obj) {
    debug('get %j', _config);
    return _config;
  }
  copy(_config, obj);
  debug('set %j', _config);
  return _config;
}

function reset() {
  _config = {};
  keys(defaults).forEach(function(key) {
    _config[key] = defaults[key];
  });
}

function copy(dest, src) {
  keys(dest).forEach(function(key) {
    if (src[key] !== null && src[key] !== undefined) {
      dest[key] = src[key];
    }
  });
  return dest;
}
