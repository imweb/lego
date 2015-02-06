'use strict';

var through = require('through2');
var duplexer = require('duplexer2');
var File = require('vinyl');
var clone = require('clone');
var pedding = require('pedding');

module.exports = function() {
  var output = through.obj();
  var streams = Array.prototype.slice.call(arguments);

  // if no stream, just return a passthrough stream
  if (streams.length === 0) {
    return output;
  }

  // if only one stream, it will create a passthrough stream
  if (streams.length === 1) {
    streams.push(through.obj());
  }

  var onEnd = pedding(streams.length, output.end.bind(output));
  streams.forEach(function(stream) {
    stream.on('error', function(err) {
      output.emit('error', err);
    }).on('end', onEnd);
    stream.pipe(output, {end: false});
  });

  var mirror = through.obj(function transform(file, enc, cb) {
    streams.forEach(function(stream) {
      stream.write(cloneObj(file));
    });
    cb();
  }, function flush(cb) {
    streams.forEach(function(stream) {
      stream.end();
    });
    cb();
  });

  return duplexer(mirror, output);
};

function cloneObj(obj) {
  if (obj instanceof File) {
    var file = obj.clone();
    obj.originPath && (file.originPath = obj.originPath);
    return file;
  }

  return clone(obj);
}
