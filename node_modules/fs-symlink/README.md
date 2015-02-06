
# symlink

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Gittip][gittip-image]][gittip-url]

Symlinking, but it checks whether the symlink already exists
as well as fix various other annoyances such as `mkdirp`.

## API

```js
var link = require('fs-symlink')

link('package.json', 'alias.json', 'junction').then(function () {

})
```

[npm-image]: https://img.shields.io/npm/v/fs-symlink.svg?style=flat-square
[npm-url]: https://npmjs.org/package/fs-symlink
[github-tag]: http://img.shields.io/github/tag/fs-utils/symlink.svg?style=flat-square
[github-url]: https://github.com/fs-utils/symlink/tags
[travis-image]: https://img.shields.io/travis/fs-utils/symlink.svg?style=flat-square
[travis-url]: https://travis-ci.org/fs-utils/symlink
[coveralls-image]: https://img.shields.io/coveralls/fs-utils/symlink.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/fs-utils/symlink?branch=master
[david-image]: http://img.shields.io/david/fs-utils/symlink.svg?style=flat-square
[david-url]: https://david-dm.org/fs-utils/symlink
[license-image]: http://img.shields.io/npm/l/symlink.svg?style=flat-square
[license-url]: LICENSE.md
[downloads-image]: http://img.shields.io/npm/dm/fs-symlink.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/fs-symlink
[gittip-image]: https://img.shields.io/gittip/jonathanong.svg?style=flat-square
[gittip-url]: https://www.gittip.com/jonathanong/
