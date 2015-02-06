# mixarg

[![NPM version](https://img.shields.io/npm/v/mixarg.svg?style=flat)](https://npmjs.org/package/mixarg)
[![Build Status](https://img.shields.io/travis/popomore/mixarg.svg?style=flat)](https://travis-ci.org/popomore/mixarg)
[![Build Status](https://img.shields.io/coveralls/popomore/mixarg?style=flat)](https://coveralls.io/r/popomore/mixarg)
[![NPM downloads](http://img.shields.io/npm/dm/mixarg.svg?style=flat)](https://npmjs.org/package/mixarg)

mixin argument with defaults using minimist

---

## Install

```
$ npm install mixarg -g
```

## Usage

```
var mixarg = require('mixarg');
var default = {
  cwd: process.cwd(),
  include: 'relative',
  verbose: false
};
mixarg(defaults, '--verbose --include=all', {cwd: '/home/admin'});
// return
// {
//   cwd: '/home/admin',
//   include: 'all',
//   verbose: true
// }
```

## API

mixarg(arg1, ..., argN);

- arg should be object or string(parsed by minimist)
- the latter argument has high priority than the former one

## LISENCE

Copyright (c) 2014 popomore. Licensed under the MIT license.
