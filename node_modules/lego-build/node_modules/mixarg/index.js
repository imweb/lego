'use strict';

var minimist = require('minimist');
var extend = require('extend');

module.exports = function mixarg(defaults) {
  if (!isObject(defaults)) {
    throw new Error('defaults should be object');
  }

  var args = [].slice.call(arguments);
  args = args.map(function(item) {
    return normalize(item);
  });

  var ret = {}, mixin = extend.apply(null, [{}].concat(args));

  Object.keys(mixin).forEach(function(key) {
    if (key in defaults) {
      ret[key] = mixin[key];
    }
  });

  return ret;
};

function normalize(arg) {
  if (isObject(arg)) {
    return arg;
  }

  if (typeof arg === 'string' || Array.isArray(arg)) {
    arg = minimist(Array.isArray(arg) ? arg : arg.split(' '));
    // hotfix minimist: --camel-case > camelCase
    for (var key in arg) {
      if (key.indexOf('-') > -1) {
        arg[camelcase(key)] = arg[key];
      }
    }
    return arg;
  }

  throw new Error('arguments should be string or object.');
}

function isObject(obj) {
  return ({}).toString.call(obj) === '[object Object]';
}

function camelcase(flag) {
  return flag.split('-').reduce(function(str, word){
    return str + word[0].toUpperCase() + word.slice(1);
  });
}
