# stream-switch [![Build Status](https://travis-ci.org/popomore/stream-switch.png?branch=master)](https://travis-ci.org/popomore/stream-switch) [![Coverage Status](https://coveralls.io/repos/popomore/stream-switch/badge.png?branch=master)](https://coveralls.io/r/popomore/stream-switch?branch=master) 

Stream condition for switch/case, just like [ternary-stream](https://github.com/robrich/ternary-stream) for if/else

---

## Install

```
$ npm install stream-switch -g
```

## Usage

![](https://raw.githubusercontent.com/popomore/stream-switch/master/img/switch.png)

```
var switchStream = require('stream-switch');

process.in
.pipe(switchStream(function(buf) {
  if (buf > 0) {
    return 'case1';
  } else if (buf < 0) {
    return 'case2'
  }
}, {
  'case1': streamA,
  'case2': streamB
}))
.pipe(process.stdout)
```

If buf great than 0, then pipe to streamA. If buf less than 0, then pipe to streamB. Otherwise buf equal to 0, pipe to output directly.

## API

switchStream(switch, cases)

#### switch

Switch condition determine which case will be choose.

Switch can be any type, if switch is function, it will be called.

#### cases

Choose which stream will be piped to by key switch return.

## LISENCE

Copyright (c) 2014 popomore. Licensed under the MIT license.
