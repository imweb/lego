var defaultValues = require('./defaultValues');
var utils = require('./utils');

var estraverse = require('estraverse');

module.exports = function(obj) {
  var moduleName = obj.moduleName,
    isOptimized = obj.isOptimized,
    callback = obj.callbackFunc,
    node = obj.node,
    name = callback.name,
    type = callback.type,
    range = (node.range || defaultValues.defaultRange),
    loc = (node.loc || defaultValues.defaultLOC),
    callbackFunc = obj.callbackFunc;

  var callbackFuncArgs = [];
  if (utils.hasExports(node.expression.arguments[2].body)) {
    callbackFuncArgs = [{
      "type": "ObjectExpression",
      "properties": []
    }];
  }

  var callbackFuncParams = obj.callbackFuncParams;
  var nBody = node.expression.arguments[2].body;
  if (!utils.hasExportsOrModuleExports(nBody)) {
    callbackFuncParams = [];
  }

  var cb = (function() {
    if(callbackFunc.type === 'Literal' || (callbackFunc.type === 'Identifier' && callbackFunc.name === 'undefined') || isOptimized === true) {
      return callbackFunc;
    } else {
      return {
        'type': 'CallExpression',
        'callee': {
          'type': 'FunctionExpression',
          'id': {
            'type': 'Identifier',
            'name': '',
            'range': range,
            'loc': loc
          },
          'params': callbackFuncParams,
          'defaults': [],
          'body': callbackFunc.body,
          'rest': callbackFunc.rest,
          'generator': callbackFunc.generator,
          'expression': callbackFunc.expression,
          'range': range,
          'loc': loc
        },
        'arguments': callbackFuncArgs,
        'range': range,
        'loc': loc
      };
    }
  }());

  var updatedNode = {
    'type': 'ExpressionStatement',
    'expression': {
      'type': 'AssignmentExpression',
      'operator': '=',
      'left': {
        'type': 'Identifier',
        'name': moduleName,
        'range': range,
        'loc': loc
      },
      'right': cb,
      'range': range,
      'loc': loc
    },
    'range': range,
    'loc': loc
  };

  estraverse.replace(callbackFunc, {
    'enter': function (node) {
      if (utils.isModuleExports(node)) {
        return {
          'type': 'AssignmentExpression',
          'operator': '=',
          'left': {
            'type': 'Identifier',
            'name': 'exports'
          },
          'right': node.right
        };
      } else {
        return node;
      }
    }
  });

  return updatedNode;
};