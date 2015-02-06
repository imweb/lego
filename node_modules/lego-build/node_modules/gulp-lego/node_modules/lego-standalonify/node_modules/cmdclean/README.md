# cmdclean

[![NPM version](https://img.shields.io/npm/v/cmdclean.svg?style=flat)](https://npmjs.org/package/cmdclean)
[![Build Status](https://img.shields.io/travis/sorrycc/cmdclean.svg?style=flat)](https://travis-ci.org/sorrycc/cmdclean)
[![Coverage Status](https://img.shields.io/coveralls/sorrycc/cmdclean.svg?style=flat)](https://coveralls.io/r/sorrycc/cmdclean)
[![NPM downloads](http://img.shields.io/npm/dm/cmdclean.svg?style=flat)](https://npmjs.org/package/cmdclean)

A build tool that converts CMD code to standard JavaScript.

---

## Install

```bash
$ npm install cmdclean
```

## Usage

```bash
var cmdclean = require('cmdclean');
cmdclean(code, opts);
```

## Options

### umd

Add umd wrapper, the value of umd will be assigned to window with the entry module.

## Thanks to

* [amdclean](https://github.com/gfranko/amdclean)
* [kclean](https://github.com/kissyteam/kclean)

## LISENCE

Copyright (c) 2014 sorrycc. Licensed under the MIT license.
