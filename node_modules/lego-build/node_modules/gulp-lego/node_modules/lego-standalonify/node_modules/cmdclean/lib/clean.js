var utils = require('./utils');
var defaultValues = require('./defaultValues');
var traverseAndUpdateAst = require('./traverseAndUpdateAst');
var findAndStoreAllModuleIds = require('./findAndStoreAllModuleIds');
var createAst = require('./createAst');
var generateCode = require('./generateCode');
var normalizeModuleName = require('./normalizeModuleName');

var _ = require('lodash');
var estraverse = require('estraverse');


// clean
// -----
//  Creates an AST using Esprima, traverse and updates the AST using Estraverse, and generates standard JavaScript using Escodegen.
module.exports = function() {
  var amdclean = this;
  var options = amdclean.options;
  var ignoreModules = options.ignoreModules;
  var originalAst = {};
  var ast = {};
  var generatedCode;
  var declarations = [];
  var hoistedVariables = {};
  var hoistedCallbackParameters = {};
  var defaultRange = defaultValues.defaultRange;
  var defaultLOC = defaultValues.defaultLOC;

  // Creates and stores an AST representation of the code
  originalAst = createAst.call(amdclean);

  // Start sort
  var dependencyMap = {};

  originalAst.body.forEach(function(body) {
    var args = body.expression.arguments;
    var moduleName = args[0].value;
    var deps = [];
    if (args[1].type === 'ArrayExpression') {
      deps = args[1].elements.map(function(item) {
        return item.value;
      });
    }
    if (args[2].type === 'FunctionExpression') {
      deps = deps.concat(utils.getRequires((args[2].body)));
    }
    deps = _.uniq(deps);
    dependencyMap[moduleName] = {
      name: moduleName,
      dependencies: deps
    };
  });

  for(var key in dependencyMap) {
    dependencyMap[key].dependencies = dependencyMap[key].dependencies.filter(function(item){
      return dependencyMap[item];
    });
  }

  var map = utils.topologicalSort(dependencyMap);

  originalAst.body.sort(function(a,b){
    var  mod1 = a.expression.arguments[0].value,
      mod2 = b.expression.arguments[0].value;

    return map[mod1] - map[mod2];
  });

  var lastMod = originalAst.body[originalAst.body.length-1];
  var entryMod = normalizeModuleName.call(amdclean, lastMod.expression.arguments[0].value);
  // End sort

  // Loops through the AST, finds all module ids, and stores them in the current instance storedModules property
  findAndStoreAllModuleIds.call(amdclean, originalAst);

  // Traverses the AST and removes any AMD trace
  ast = traverseAndUpdateAst.call(amdclean, {
    ast: originalAst
  });

  // Post Clean Up
  // Removes all empty statements from the source so that there are no single semicolons and
  // Makes sure that all require() CommonJS calls are converted
  // And all aggressive optimizations (if the option is turned on) are handled
  if(ast && _.isArray(ast.body)) {
    estraverse.replace(ast, {
      enter: function(node, parent) {
        var normalizedModuleName;

        if(node === undefined || node.type === 'EmptyStatement') {
          _.each(parent.body, function(currentNode, iterator) {
            if(currentNode === undefined || currentNode.type === 'EmptyStatement') {
              parent.body.splice(iterator, 1);
            }
          });
        } else if(utils.isRequireExpression(node)) {

          if(node['arguments'] && node['arguments'][0] && node['arguments'][0].value) {
            normalizedModuleName = normalizeModuleName.call(amdclean, node['arguments'][0].value);

            if(ignoreModules.indexOf(normalizedModuleName) === -1) {
              return {
                'type': 'Identifier',
                'name': normalizedModuleName,
                'range': (node.range || defaultRange),
                'loc': (node.loc || defaultLOC)
              };
            } else {
              return node;
            }
          } else {
            return node;
          }
        }
      }
    });
  }

  // Makes any necessary modules global by appending a global instantiation to the code
  // eg: window.exampleModule = exampleModule;
  if(_.isArray(options.globalModules)) {

    _.each(options.globalModules, function(currentModule) {

      if(_.isString(currentModule) && currentModule.length) {
        ast.body.push({
          'type': 'ExpressionStatement',
          'expression': {
            'type': 'AssignmentExpression',
            'operator': '=',
            'left': {
              'type': 'MemberExpression',
              'computed': false,
              'object': {
                'type': 'Identifier',
                'name': 'window',
                'range': defaultRange,
                'loc': defaultLOC
              },
              'property': {
                'type': 'Identifier',
                'name': currentModule,
                'range': defaultRange,
                'loc': defaultLOC
              },
              'range': defaultRange,
              'loc': defaultLOC
            },
            'right': {
              'type': 'Identifier',
              'name': currentModule,
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
    });
  }

  // Hoists all modules and necessary callback parameters
  hoistedVariables = _.merge(_.cloneDeep(_.reduce(amdclean.storedModules, function(storedModules, key, val) {
    if(key !== false) {
      storedModules[val] = true;
    }
    return storedModules;
  }, {})), hoistedCallbackParameters);

  // Creates variable declarations for each AMD module/callback parameter that needs to be hoisted
  _.each(hoistedVariables, function(moduleValue, moduleName) {
    if(!_.contains(options.ignoreModules, moduleName)) {
      declarations.push({
        'type': 'VariableDeclarator',
        'id': {
          'type': 'Identifier',
          'name': moduleName,
          'range': defaultRange,
          'loc': defaultLOC
        },
        'init': null,
        'range': defaultRange,
        'loc': defaultLOC
      });
    }
  });

  // If there are declarations, the declarations are preprended to the beginning of the code block
  if(declarations.length) {
    ast.body.unshift({
      'type': 'VariableDeclaration',
      'declarations': declarations,
      'kind': 'var',
      'range': defaultRange,
      'loc': defaultLOC
    });
  }

  // Converts the updated AST to a string of code
  generatedCode = generateCode.call(amdclean, ast);

  // UMD Wrap
  if (options.umd) {
    var umd = [
'if (typeof exports == "object") {',
'  module.exports = {{entry}};',
'} else if (typeof define == "function" && (define.cmd || define.amd)) {',
'  define(function(){ return {{entry}} });',
'} else {',
'  this["{{global}}"] = {{entry}};',
'}'].join('\n');
    umd = utils.template(umd, {
      global: options.umd,
      entry: entryMod
    });

    generatedCode = generatedCode + '\n\n' + umd;
  }

  // If there is a wrap option specified
  if(_.isObject(options.wrap)) {
    generatedCode = options.wrap.start + generatedCode + options.wrap.end;
  }

  return generatedCode;
};
