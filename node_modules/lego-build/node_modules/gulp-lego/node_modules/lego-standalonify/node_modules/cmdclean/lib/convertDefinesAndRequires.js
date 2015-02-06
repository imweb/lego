var utils = require('./utils');
var convertToFunctionExpression = require('./convertToFunctionExpression');
var defaultValues = require('./defaultValues');
var normalizeModuleName = require('./normalizeModuleName');
var createAst = require('./createAst');
var _ = require('lodash');

module.exports = function convertDefinesAndRequires(node, parent) {
  var amdclean = this;
  var options = amdclean.options;
  var moduleName;
  var args;
  var dependencies;
  var moduleReturnValue;
  var moduleId;
  var params;
  var isDefine = utils.isDefine(node);
  var isRequire = utils.isRequire(node);
  var startLineNumber;
  var type = '';
  var shouldBeIgnored;
  var parentHasFunctionExpressionArgument;
  var defaultRange = defaultValues.defaultRange;
  var defaultLOC = defaultValues.defaultLOC;
  var range = node.range || defaultRange;
  var loc = node.loc || defaultLOC;
  var dependencyBlacklist = defaultValues.dependencyBlacklist;
  var shouldOptimize;

  startLineNumber = isDefine || isRequire ? node.expression.loc.start.line : node && node.loc && node.loc.start ? node.loc.start.line : null;

  shouldBeIgnored = (amdclean.matchingCommentLineNumbers[startLineNumber] || amdclean.matchingCommentLineNumbers[startLineNumber - 1]);

  utils.transformCommonJSDeclaration(node);

  if(isDefine) {
    args = Array.prototype.slice.call(node.expression['arguments'], 0);

    moduleReturnValue = args[args.length - 1];

    moduleId = node.expression['arguments'][0].value;

    moduleName = normalizeModuleName.call(amdclean, moduleId);

    shouldOptimize = !amdclean.conditionalModulesToNotOptimize[moduleName];

    dependencies = (function() {
      var deps = args[args.length - 2],
        depNames = [],
        hasExportsParam;

      if(_.isPlainObject(deps)) {
        deps = deps.elements || [];
      } else {
        deps = [];
      }

      hasExportsParam = _.where(deps, {
        'value': 'exports'
      }).length;

      if(_.isArray(deps) && deps.length) {

        _.each(deps, function(currentDependency) {
          if(dependencyBlacklist[currentDependency.value] && !shouldOptimize) {
            depNames.push(currentDependency.value);
          } else if(dependencyBlacklist[currentDependency.value] !== 'remove') {
            if(dependencyBlacklist[currentDependency.value]) {
              depNames.push('{}');
            } else {
              depNames.push(currentDependency.value);
            }
          } else {
            if(!hasExportsParam) {
              depNames.push('{}');
            }
          }
        });
      }
      return depNames;
    }());

    params = {
      'node': node,
      'moduleName': moduleName,
      'moduleId': moduleId,
      'dependencies': dependencies,
      'moduleReturnValue': moduleReturnValue,
      'isDefine': isDefine,
      'isRequire': isRequire,
      'range': range,
      'loc': loc,
      'shouldOptimize': shouldOptimize
    };

    if(shouldBeIgnored || !moduleName || amdclean.conditionalModulesToIgnore[moduleName] === true) {
      amdclean.options.ignoreModules.push(moduleName);
      return node;
    }

    if(_.contains(options.removeModules, moduleName)) {

      amdclean.storedModules[moduleName] = false;

      // Remove the current module from the source
      return {
        'type': 'EmptyStatement'
      };
    }

    if(_.isObject(options.shimOverrides) && options.shimOverrides[moduleName]) {
      params.moduleReturnValue = createAst.call(amdclean, options.shimOverrides[moduleName]);

      if(_.isArray(params.moduleReturnValue.body) && _.isObject(params.moduleReturnValue.body[0])) {

        if(_.isObject(params.moduleReturnValue.body[0].expression)) {
          params.moduleReturnValue = params.moduleReturnValue.body[0].expression;
          type = 'objectExpression';
        }
      } else {
        params.moduleReturnValue = moduleReturnValue;
      }
    }

    if(params.moduleReturnValue && params.moduleReturnValue.type === 'Identifier') {
      type = 'functionExpression';
    }

    if(_.contains(options.ignoreModules, moduleName)) {
      return node;
    } else if(utils.isFunctionExpression(moduleReturnValue) || type === 'functionExpression') {
      return convertToFunctionExpression.call(amdclean, params);
    }

  } else {

    // If the node is a function expression that has an exports parameter and does not return anything, return exports
    if(node.type === 'FunctionExpression' &&
      _.isArray(node.params) &&
      _.where(node.params, { 'type': 'Identifier', 'name': 'exports' }).length &&
      _.isObject(node.body) &&
      _.isArray(node.body.body) &&
      !_.where(node.body.body, {
        'type': 'ReturnStatement'
      }).length) {

      parentHasFunctionExpressionArgument = (function () {

        if (!parent || !parent.arguments) {
          return false;
        }

        if (parent && parent.arguments && parent.arguments.length) {
          return _.where(parent.arguments, { 'type': 'FunctionExpression' }).length;
        }

        return false;
      }());

      if(parentHasFunctionExpressionArgument) {

        // Adds the logical expression, 'exports = exports || {}', to the beginning of the function expression
        node.body.body.unshift({
          'type': 'ExpressionStatement',
          'expression': {
            'type': 'AssignmentExpression',
            'operator': '=',
            'left': {
              'type': 'Identifier',
              'name': 'exports',
              'range': defaultRange,
              'loc': defaultLOC
            },
            'right': {
              'type': 'LogicalExpression',
              'operator': '||',
              'left': {
                'type': 'Identifier',
                'name': 'exports',
                'range': defaultRange,
                'loc': defaultLOC
              },
              'right': {
                'type': 'ObjectExpression',
                'properties': [],
                'range': defaultRange,
                'loc': defaultLOC
              },
              'range': defaultRange,
              'loc': defaultLOC
            },
            'range': defaultRange,
            'loc': defaultLOC
          },
          'range': defaultRange,
          'loc': defaultLOC
        });
      }

      // Adds the return statement, 'return exports', to the end of the function expression
      node.body.body.push({
        'type': 'ReturnStatement',
        'argument': {
          'type': 'Identifier',
          'name': 'exports',
          'range': defaultRange,
          'loc': defaultLOC
        },
        'range': defaultRange,
        'loc': defaultLOC
      });
    }
    return node;
  }
};
