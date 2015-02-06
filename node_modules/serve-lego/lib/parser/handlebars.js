'use strict';

var handlebars = require('handlebars');
var join = require('path').join;
var util = require('../util');
var through = require('through2');

module.exports = function handlebarsParser(options) {
  return through.obj(function(file, enc, cb) {
    var pkg = options.pkg;
    var hpkg = pkg.dependencies['handlebars-runtime'];

    // version should be same between precompile tool and required package
    var err = check(hpkg);
    if (err) {
      return cb(err);
    }

    file = parser(file, hpkg);
    this.push(file);
  });
};

function parser(file, pkg) {
  var id = file.url.pathname.substring(1);
  var hid = pkg.name + '/' + pkg.version + '/' + pkg.main;
  var code = '' +
    'var Handlebars = require("' + hid + '")["default"];\n' +
    'module.exports = Handlebars.template(' +
    precompile(file) +
    ');';
  code = util.define(id, code);

  file.contents = new Buffer(code);
  return file;
}

function precompile(file) {
  return handlebars.precompile(String(file.contents));
}

function check(pkg) {
  var path = join(__dirname, '../../package.json');
  var ver = require(path).dependencies.handlebars;
    if (!pkg) {
      return new Error('handlebars-runtime not found in dependencies');
    }
    if (pkg.version !== ver) {
    return new Error('handlebars version should be ' + ver + ' but ' + pkg.version);
  }
}
