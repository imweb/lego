'use strict';

var minimist = require('minimist');
var extend = require('extend');

module.exports = function mixarg() {
  var args = [].slice.call(arguments);
  args = args.map(function(item) {
    return normalize(item);
  });
  return extend.apply(null, [{}].concat(args));
};

function normalize(arg) {
  if (isObject(arg)) {
    return arg;
  }

  if (typeof arg === 'string') {
    arg = arg.trim();
    if (arg === '') return null;
    arg = arg.split(/\s+/);
  }

  if (Array.isArray(arg)) {
    if (arg.length === 0) return null;
    arg = minimist(arg);
    // hotfix minimist: --camel-case > camelCase
    for (var key in arg) {
      if (key.indexOf('-') > -1) {
        arg[camelcase(key)] = arg[key];
        delete arg[key];
      }
    }
    return arg;
  }

  return null;
}

function isObject(obj) {
  return ({}).toString.call(obj) === '[object Object]';
}

function camelcase(flag) {
  return flag.split('-').reduce(function(str, word){
    return str + word[0].toUpperCase() + word.slice(1);
  });
}
