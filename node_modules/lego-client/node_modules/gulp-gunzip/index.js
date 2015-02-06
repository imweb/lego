var through = require('through2')
var gutil = require('gulp-util')
var zlib = require('zlib')

module.exports = function () {
  return through.obj(function (file, enc, callback) {
    if (file.isNull()) {
      this.push(file)
      return callback()
    }

    var path = file.path.replace(/\.gz$/, '')

    if (file.isStream()) {
      this.push(new gutil.File({
        path: path,
        contents: file.contents.pipe(zlib.createGunzip())
      }))

      callback()
    }

    if (file.isBuffer()) {
      zlib.gunzip(file.contents, function (err, buffer) {
        if (err) return this.emit('error', err)

        this.push(new gutil.File({
          path: path,
          contents: buffer
        }))

        callback()
      }.bind(this))
    }
  })
}
