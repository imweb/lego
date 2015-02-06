'use strict';

var duplexer = require('duplexer2');
var through = require('through2');
var Stream = require('stream');
var pedding = require('pedding');

module.exports = function(_switch, cases) {
  var output = through.obj();

  var indexes = [], streams = [];
  for (var key in cases) {
    var stream = cases[key];
    if (!(stream instanceof Stream)) throw new Error(key + ' is not stream');
    streams.push(stream);
    indexes.push(key);
  }

  // stream end when all read ends
  var end = pedding(streams.length + 1, function() {
    output.end();
  });

  streams.forEach(function(stream) {
    stream.on('error', function(err) {
      output.emit('error', err);
    });
    stream.on('end', end);
    stream.pipe(output, {end: false});
  });

  /*
    input ---(unmatch)-------->--、
      `---(caseA)----> streamA --->-、
      `---(caseB)----> streamB ------> output
  */
  var input = through.obj(function transport(buf, enc, cb) {
    var res = callSwtich(_switch, buf);
    var i = indexes.indexOf(res);
    if (i > -1) {
      streams[i].write(buf);
      return cb();
    }
    this.push(buf);
    cb();
  }, function flush(cb) {
    streams.forEach(function(stream) {
      stream.end();
    });
    end();
    cb();
  });

  input.pipe(output, {end: false});

  return duplexer(input, output);
};

function callSwtich(_switch, buf) {
  if (typeof _switch === 'function') {
    return _switch(buf);
  }
  return _switch;
}
