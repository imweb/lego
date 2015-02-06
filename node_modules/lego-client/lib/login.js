'use strict';

var extend = require('extend');
var request = require('./request');
var util = require('./util');
var debug = require('debug')('lego-client:info');

/*
  login(args, config)

  * args
    * username: the username of registry
    * authkey: the authKey that copied from legojs accout page
  * config
*/

module.exports = function* login(args, config) {
  args = extend({}, require('./config')(), config, args);

  if (!(args.authkey && args.username)) {
    throw new Error('Missing parameters.');
  }

  var req = {};
  req.url = args.registry + '/account/login/';
  req.method = 'POST';
  req.json = {
    account: args.username,
    authkey: args.authkey
  };

  debug('login %s', args.username);
  var res = yield* request(req);
  util.errorHandle(req, res);
  return res.body;
};
