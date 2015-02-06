'use strict';

var debug = require('debug')('lego-client:util');

var ID_REGEX = /^([a-z][a-z0-9\-\.]*)(?:@(.+))?$/;
var NAME_REGEX = /^[a-z][a-z0-9\-\.]*$/i;

exports.errorHandle = errorHandle;
exports.resolveid = resolveid;
exports.ID_REGEX = ID_REGEX;
exports.NAME_REGEX = NAME_REGEX;

function errorHandle(req, res) {
  var err;
  if (res.statusCode >= 500) {
    err = new Error('Server error ~ ' + req.url);
    err.statusCode = res.statusCode;
    debug('request %s error: %s, statusCode: %s', req.url, err.message, res.statusCode);
    throw err;
  }
  var body = res.body;
  if (res.statusCode >= 400) {
    err = new Error(body.message + ' ~ ' + req.url);
    err.statusCode = res.statusCode;
    err.status = body.status;
    debug('request %s error: %s, statusCode: %s', req.url, err.message, res.statusCode);
    throw err;
  }
}

function resolveid(uri) {
  uri = uri.toLowerCase();
  var m = uri.match(ID_REGEX);
  if (!m) return null;
  return {
    name: m[1],
    version: m[2] || ''
  };
}
