var shell = require('shelljs');
var name = shell.exec('git config --get user.name', {
  silent: true
}).output.trim();
var email = shell.exec('git config --get user.email', {
  silent: true
}).output.trim();

var result = name ? name : process.env.USER;

if (email) {
  result += ' <' + email + '>';
}

module.exports = result;
