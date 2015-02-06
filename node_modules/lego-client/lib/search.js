'use strict';

var extend = require('extend');
var format = require('util').format;
var request = require('./request');
var util = require('./util');
var debug = require('debug')('lego-client:search');

/*
  info(args, config)

  * args
    * name: search packages with your query name
  * config: see client.config
*/

module.exports = function* search(args, config) {
  args = extend({}, require('./config')(), config, args);

  var req = {};
  req.url = format('%s/repository/search?q=%s', args.registry, args.name);
  req.method = 'GET';
  req.json = true;

  debug('search package with %s', args.name);
  var res = yield* request(req);
  util.errorHandle(req, res);
  return res.body;
};
