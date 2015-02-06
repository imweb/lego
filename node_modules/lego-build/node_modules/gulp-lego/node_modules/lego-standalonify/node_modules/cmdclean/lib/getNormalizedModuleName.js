var utils = require('./utils');
var normalizeModuleName = require('./normalizeModuleName');

module.exports = function getNormalizedModuleName(node) {
  if(!utils.isDefine(node)) {
    return;
  }

  var amdclean = this;
  var moduleId = node.expression['arguments'][0].value;

  return normalizeModuleName.call(amdclean, moduleId);
};
