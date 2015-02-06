var errorMsgs = require('./errorMsgs');
var convertDefinesAndRequires = require('./convertDefinesAndRequires');

var _ = require('lodash');
var estraverse = require('estraverse');

module.exports = function(obj) {
  var amdclean = this;
  var options = amdclean.options;
  var ast = obj.ast;

  if(!_.isPlainObject(obj)) {
    throw new Error(errorMsgs.invalidObject('traverseAndUpdateAst'));
  }

  if(!ast) {
    throw new Error(errorMsgs.emptyAst('traverseAndUpdateAst'));
  }

  if(!_.isPlainObject(estraverse) || !_.isFunction(estraverse.replace)) {
    throw new Error(errorMsgs.estraverse);
  }

  estraverse.replace(ast, {
    'enter': function(node, parent) {
      var ignoreComments;

      if(node.type === 'Program') {
        ignoreComments = (function() {
          var arr = [];
          var currentLineNumber;

          amdclean.comments = node.comments;

          _.each(node.comments, function(currentComment) {
            var currentCommentValue = (currentComment.value).trim();

            if(currentCommentValue === options.commentCleanName) {
              arr.push(currentComment);
            }
          });
          return arr;
        }());

        _.each(ignoreComments, function(currentComment) {
          currentLineNumber = currentComment.loc.start.line;
          amdclean.matchingCommentLineNumbers[currentLineNumber] = true;
        });

        return node;
      }

      return convertDefinesAndRequires.call(amdclean, node, parent);
    },
    'leave': function(node) {
      return node;
    }
  });

  return ast;
};
