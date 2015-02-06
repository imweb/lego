'use strict';

var os = require('os');
var util = require('util');
var coRequest = require('co-request');
var pkg = require('../package.json');
var debug = require('debug')('lego-client:request');

var userAgent = util.format('lego-client (%s, %s, %s %s)',
  pkg.version, process.version, os.platform(), os.arch()
);

/*
  request(args)

  args will pass to [request](https://github.com/mikeal/request)
  * special args
    * auth: has permission to talk with server, found in client.config
    * force: change force header
*/

module.exports = function* request(args) {
  args.headers = args.headers || {};
  args.headers['user-agent'] = userAgent;
  args.headers['Accept-Language'] = process.env.LANG || 'en_US';

  if (args.auth) {
    args.headers['Authorization'] = 'Yuan ' + args.auth;
    // conflict with request
    delete args.auth;
  }

  if (args.force) {
    args.headers['X-Yuan-Force'] = 'true';
  }

  // always use gzip, and gunzip by request
  args.gzip = true;

  debug('request %s %s', args.method, args.url);
  Object.keys(args.headers).forEach(function(key) {
    debug('header %s: %s', key, args.headers[key]);
  });

  try {
    return yield coRequest(args);
  } catch(err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      debug('request error with %s', err.code);
    }
    throw err;
  }
};
