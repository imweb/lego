/*!
 * pedding - index.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

module.exports = pedding;

function pedding(n, fn) {
  if (typeof n === 'function') {
    var tmp = n;
    n = fn;
    fn = tmp;
  }

  var called = false;
  var times = 0;
  return function (err) {
    if (called) {
      return;
    }
    if (err) {
      called = true;
      return fn(err);
    }
    times++;
    if (times === n) {
      fn();
    } else if (times > n) {
      throw new Error('Expect to call ' + n + ' times, but got ' + times);
    }
  };
}
