'use strict';

var path = require('path');
var through2 = require('through2');

module.exports = function (options) {
  options = options || {};
  var reactTransform;
  if (options.reactTools) {
    reactTransform = require(options.reactTools).transform;
  } else {
    reactTransform = require('react-tools').transform;
  }

  function compile(file, enc, callback) {
    if (file.isNull()) return callback(null, file);
    if (file.isStream()) return callback(new Error('Streams are not supported!'));

    var isJSXFile = path.extname(file.path) === '.jsx';
    if (isJSXFile) {
      file.path = file.path.replace(/\.jsx$/, '.js');
    }
    var data = file.contents.toString(enc);
    if (!isJSXFile) {
      isJSXFile = /\/\*\*(\s)@jsx/.test(data.split('\n')[0]);
    }
    if (isJSXFile) {
      try {
        var transformed = reactTransform(data, options.transformOptions || {});
        file.contents = new Buffer(transformed, enc);
        this.push(file);
        callback();
      } catch (error) {
        error.name = 'JsxError';
        error.message = file.path + ': ' + error.message;
        error.fileName = file.path;
        callback(error);
      }
    } else {
      this.push(file);
      callback();
      return;
    }
    ;
  }

  return through2.obj(compile);
};
