'use strict';

var path = require('path');
var join = path.join;
var through = require('through2');
var util = require('../util');
var extendOption = util.extendOption;
var template = util.template;
var common = require('../common');
var resolveIdleading = common.resolveIdleading;
var debug = require('debug')('transport:dest');

module.exports = function dest(opt) {
  opt = extendOption(opt);

  return through.obj(function(gfile, enc, cb) {
    debug('filepath:%s', gfile.path);
    var prefix = getPrefix(gfile.file, opt);
    gfile.path = join(gfile.base, prefix, gfile.relative);
    this.push(gfile);
    cb();
  });
};

function getPrefix(file, opt) {
  var idleading = resolveIdleading(opt.idleading, file.path, file.pkg);
  return template(idleading, file.pkg);
}
