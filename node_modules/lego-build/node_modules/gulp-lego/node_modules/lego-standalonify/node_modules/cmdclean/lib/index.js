var defaultOptions = require('./defaultOptions');
var clean = require('./clean');

var _ = require('lodash');

// CMDclean constructor function
var CMDclean = function(options, overloadedOptions) {
  var defaultOptions = _.cloneDeep(this.defaultOptions);
  var userOptions = options || {};

  if(!_.isPlainObject(options) && _.isString(options)) {
    userOptions = _.merge({
      'code': options
    }, _.isObject(overloadedOptions) ? overloadedOptions : {});
  }

  // storedModules
  // -------------
  // An object that will store all of the user module names
  this.storedModules = {};

  // variablesStore
  // --------------
  // An object that will store all of the local variables that are declared
  this.variablesStore = {};

  // originalAst
  // -----------
  // The original AST (Abstract Syntax Tree) before it is transformed
  this.originalAst = {};

  // conditionalModulesToIgnore
  // --------------------------
  // An object that will store any modules that should be ignored (not cleaned)
  this.conditionalModulesToIgnore = {};

  // conditionalModulesToNotOptimize
  // -------------------------------
  // An object that will store any modules that should not be optimized (but still cleaned)
  this.conditionalModulesToNotOptimize = {};

  // matchingCommentLineNumbers
  // --------------------------
  // An object that stores any comments that match the commentCleanName option
  this.matchingCommentLineNumbers = {};

  // comments
  // --------
  // All of the stored program comments
  this.comments = [];

  // options
  // -------
  // Merged user options and default options
  this.options = _.merge(defaultOptions, userOptions);
};

// CMDclean prototype object
CMDclean.prototype = {
  // clean
  // -----
  // Creates an AST using Esprima, traverse and updates the AST using Estraverse, and generates standard JavaScript using Escodegen.
  'clean': clean,

  // defaultOptions
  // --------------
  // Environment - either node or web
  'defaultOptions': defaultOptions
};

module.exports = function(options, overloadedOptions) {
  // Creates a new CMDclean instance
  var cmdclean = new CMDclean(options, overloadedOptions);
  // returns the cleaned code
  return cmdclean.clean();
};
