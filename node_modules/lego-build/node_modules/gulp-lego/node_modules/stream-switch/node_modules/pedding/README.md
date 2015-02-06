# pedding [![Build Status](https://secure.travis-ci.org/fengmk2/pedding.png)](http://travis-ci.org/fengmk2/pedding)

[![NPM](https://nodei.co/npm/pedding.png?downloads=true&stars=true)](https://nodei.co/npm/pedding/)

Useful tools for unit test: Just pedding for callback.

## Installation

### Node.js

```bash
$ npm install pedding
```

### [Component](https://github.com/component/component)

```bash
$ component install fengmk2/pedding
```

## Usage

```js
var pedding = require('pedding');

it('should request two resources', function (done) {
  done = pedding(2, done);
  http.get('http://fengmk2.github.com', function (res) {
    done();
  });
  http.get('http://www.taobao.com', function (res) {
    done();
  });
});
```

## License

(The MIT License)

Copyright (c) 2011-2014 fengmk2 &lt;fengmk2@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
