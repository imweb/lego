var errorMsgs = require('./errorMsgs');
var getNormalizedModuleName = require('./getNormalizedModuleName');

var _ = require('lodash');
var estraverse = require('estraverse');

module.exports = function(ast) {
  var amdclean = this;

  if(!ast) {
    throw new Error(errorMsgs.emptyAst('findAndStoreAllModuleIds'));
  }

  estraverse.traverse(ast, {
    'enter': function(node, parent) {
      var moduleName = getNormalizedModuleName.call(amdclean, node, parent);

      // If the current module has not been stored, store it
      if(moduleName && !amdclean.storedModules[moduleName]) {
        amdclean.storedModules[moduleName] = true;
      }

      if(node.type === 'VariableDeclarator') {
        amdclean.variablesStore[node.id.name] = true;
      }
    }
  });
};