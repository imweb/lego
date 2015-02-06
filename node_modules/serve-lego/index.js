
module.exports = require('./lib/express');
module.exports.util = require('./lib/util');

/* istanbul ignore else */
if (require('generator-support')) {
  module.exports.koa = require('./lib/koa');
} else {
  module.exports.koa = function() {
    throw new Error('Generator is not supported');
  };
}
