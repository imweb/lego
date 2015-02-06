# gulp-mirror [![Build Status](https://travis-ci.org/popomore/gulp-mirror.png?branch=master)](https://travis-ci.org/popomore/gulp-mirror) [![Coverage Status](https://coveralls.io/repos/popomore/gulp-mirror/badge.png?branch=master)](https://coveralls.io/r/popomore/gulp-mirror?branch=master) 

Make a mirror of stream, it's useful that do different transform of the same stream.

---

## Install

```
$ npm install gulp-mirror -g
```

## Usage

```
var mirror = require('gulp-mirror');
var gulp = require('gulp');
var streamA = through.obj();
var streamB = through.obj();

gulp.src('src')
  .pipe(mirror(streamA, streamB))
  .pipe(gulp.dest('dest'));
```

MirrorStream will pipe to both of streamA and streamB, and dest will receive both too. streamA and streamB can be transformed as you like.

**if mirror has only one argument, it will create another passthrough stream, just like clone.**

## LISENCE

Copyright (c) 2014 popomore. Licensed under the MIT license.
