'use strict';

var extend = require('extend');
var format = require('util').format;
var request = require('./request');
var util = require('./util');

/*
  unpublish(args, config)

  * args
    * name: the package name
    * version: the package version
  * config: see client.config
*/

module.exports = function* unpublish(args, config) {
  args = extend({}, require('./config')(), config, args);

  var req = {};
  req.url = format('%s/repository/%s/%s', args.registry, args.name,
    args.version ? args.version + '/' : '');
  req.method = 'DELETE';
  req.json = true;
  req.auth = args.auth;

  var res = yield* request(req);
  util.errorHandle(req, res);
  return res.body;
};
