var co = require('co');
var legorc = require('legorc');
var client = require('lego-client');

// load global config from legorc
client.config({
  registry: legorc.get('registry'),
  proxy: legorc.get('proxy'),
  auth: legorc.get('auth'),
  temp: legorc.get('user.temp')
});

exports.config = client.config;

var methods= [
  'publish',
  'unpublish',
  'login',
  'install',
  'info',
  'search',
  'category'
];

// export client api with co wrap
methods.forEach(function(method) {
  exports[method] = co(client[method]);
});
