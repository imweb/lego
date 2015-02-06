
// https://github.com/npm/npm/blob/master/lib/utils/link.js#L19

var fs = require('mz/fs')
var path = require('path')
var mkdirp = require('mkdirp-then')

var win = process.platform === 'win32'

module.exports = function (from, to, type) {
  var og = from = path.resolve(from)
  to = path.resolve(to)
  /* istanbul ignore else */
  if (!win) {
    var target = from = path.relative(path.dirname(to), from)
    if (target.length >= from.length) target = from
  }

  return fs.lstat(to).then(function (stats) {
    // if it's not a symbolic link, we recreate the link for sure
    if (!stats.isSymbolicLink()) return fs.unlink(to).then(returnTrue, returnTrue)
    return fs.realpath(to).then(function (resolved) {
      // we only recreate the link if it does not link to the same file
      if (resolved === og) return false // no need to create a symlink
      return fs.unlink(to).then(returnTrue, returnTrue)
    })
  }, buildIfMissing).then(function (makeTheLink) {
    if (!makeTheLink) return
    return mkdirp(path.dirname(to)).then(function () {
      return fs.symlink(from, to, type)
    })
  })
}

function buildIfMissing(err) {
  /* istanbul ignore else */
  if (err.code === 'ENOENT') return true
  /* istanbul ignore next */
  throw err
}

function returnTrue() {
  return true
}
