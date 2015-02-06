var escodegen = require('escodegen');

module.exports = function(ast) {
  var amdclean = this;
  var options = amdclean.options;
  var esprimaOptions = options.esprima || {};
  var escodegenOptions = options.escodegen || {};

  // Check if both the esprima and escodegen comment options are set to true
  if(esprimaOptions.comment === true && escodegenOptions.comment === true) {
    try {
      // Needed to keep source code comments when generating the code with escodegen
      ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
    } catch(e) {}
  }

  return escodegen.generate(ast, escodegenOptions);
};
