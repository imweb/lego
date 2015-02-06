# css2str [![Build Status](https://travis-ci.org/popomore/css2str.png?branch=master)](https://travis-ci.org/popomore/css2str) [![Coverage Status](https://coveralls.io/repos/popomore/css2str/badge.png?branch=master)](https://coveralls.io/r/popomore/css2str?branch=master)

Transform css to string that can be inserted by js

---

## Install

```
$ npm install css2str -g
```

## Usage

```
var css2str = require('css2str');
var code = css2str(fs.readFileSync(filepath));
```

Then you can use [import-style](https://github.com/popomore/import-style) to import css in browser.

```
var importStyle = require('import-style');
importStyle(code);
```

## Options

### prefix

This option will add a parent selector of every selector.

```
// origin css

a {
  border: none;
}

// yield
.container a{border: none;}
```

With code

```
var opt = {prefix: '.container'}
var code = css2str(fs.readFileSync(filepath), opt);
```

## LISENCE

Copyright (c) 2014 popomore. Licensed under the MIT license.
