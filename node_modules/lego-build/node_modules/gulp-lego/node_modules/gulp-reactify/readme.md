# gulp-reactify

plugin for gulp to transform react jsx file

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/gulp-reactify.svg?style=flat-square
[npm-url]: http://npmjs.org/package/gulp-reactify
[download-image]: https://img.shields.io/npm/dm/gulp-reactify.svg?style=flat-square
[download-url]: https://npmjs.org/package/gulp-reactify

## Usage

```js
gulp.src('**/*.js').pipe(require('gulp-reactify')({
  reactTools: require('reactTools')
}))
```