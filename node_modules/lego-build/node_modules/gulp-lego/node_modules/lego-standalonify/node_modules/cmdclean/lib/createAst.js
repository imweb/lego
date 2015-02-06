var esprima = require('esprima');
var errorMsgs = require('./errorMsgs');
var utils = require('./utils');

var _ = require('lodash');

module.exports = function(providedCode) {
  var amdclean = this;
  var options = amdclean.options;
  var filePath = options.filePath;
  var code = providedCode || options.code || (filePath ? utils.readFile(filePath) : '');
  var esprimaOptions = options.esprima;

  if(!code) {
    throw new Error(errorMsgs.emptyCode);
  } else {
    if(!_.isPlainObject(esprima) || !_.isFunction(esprima.parse)) {
      throw new Error(errorMsgs.esprima);
    }
    return esprima.parse(code, esprimaOptions);
  }
};
