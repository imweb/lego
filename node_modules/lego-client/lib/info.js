'use strict';

var extend = require('extend');
var format = require('util').format;
var request = require('./request');
var util = require('./util');
var debug = require('debug')('lego-client:info');

/*
  info(args, config)

  * args
    * name: the package name
    * version: the package version
  * config: see client.config
*/

module.exports = function* info(args, config) {
  args = extend({}, require('./config')(), config, args);

  // name@tag
  if (args.version && args.version.indexOf('.') === -1) {
    args.tag = args.version;
    delete args.version;
  }

  var req = {};
  if (args.version) {
    req.url = format('%s/repository/%s/%s/', args.registry, args.name, args.version);
  } else {
    req.url = format('%s/repository/%s/', args.registry, args.name);
  }
  req.method = 'GET';
  req.json = true;

  debug('get package info %s@%s~%s url %s',
    args.name, args.version || '-', args.tag || '-', req.url);
  var res = yield* request(req);

  util.errorHandle(req, res);

  var body = args.tag ? getPackageWithTag(res.body, args) : getPackage(res.body, args);
  if (!body) {
    var err = new Error('no matched package ' + args.name + (args.tag ? ' ~ ' + args.tag : ''));
    err.statusCode = res.statusCode;
    throw err;
  }
  debug('response body %j', body);
  return body;
};

function getPackageWithTag(body, args) {
  var version = Object.keys(body.packages)
  .filter(function(version) {
    return body.packages[version].tag === args.tag;
  })
  .sort(function(a, b){
    return a < b;
  })[0];
  if (!version) return null;
  return body.packages[version];
}

function getPackage(body, args) {
  if (!body.packages) return body;
  if (args.version) {
    debug('get package version %s', version);
    return body.packages[args.version];
  } else {
    return body;
  }
}
