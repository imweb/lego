# css-imports [![Build Status](https://travis-ci.org/popomore/css-imports.png?branch=master)](https://travis-ci.org/popomore/css-imports) [![Coverage Status](https://coveralls.io/repos/popomore/css-imports/badge.png?branch=master)](https://coveralls.io/r/popomore/css-imports?branch=master) 

find all @import in css

---

## Install

```
$ npm install css-imports -g
```

## Usage

Css file a.css

```
@import url("./b.css");
@import url("c.css");
```

Run code

```
var imports = require('css-imports');
imports(fs.readFileSync('a.css'));
```

return

```
[
  {
    string: '@import url("./b.css");',
    path: './b.css',
    index: 0
  },
  {
    string: '@import url("c.css");',
    path: 'c.css',
    index: 24
  }
]
```

You can add a callback to replace css file

```
imports(fs.readFileSync('a.css'), function(item) {
  return '@import url("' + resolve(item.path) + '");';
});
```

## LISENCE

Copyright (c) 2014 popomore. Licensed under the MIT license.
