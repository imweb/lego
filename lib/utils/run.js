var join = require('path').join;
var dirname = require('path').dirname;
var legorc = require('legorc');
var runfile = join(legorc.get('user.home'), '.lego', 'run.json');
var exists = require('fs').existsSync;
var readJSON = require('fs-extra').readJSONSync;
var writeJSON = require('fs-extra').writeJSONSync;
var mkdirs = require('fs-extra').mkdirsSync;

function info(name) {
  var data = {};
  if (exists(runfile)) {
    data = readJSON(runfile);
  }
  if (!name) {
    return data || {};
  }
  return data[name] || {};
}

exports.info = info;

function record(name, options) {
  var data = info();
  var ret = data[name] || {};

  if (options) {
    Object.keys(options).forEach(function(key) {
      ret[key] = options[key];
    });
  }

  ret.name = name;
  if (ret.count) {
    ret.count += 1;
  } else {
    ret.count = 1;
  }
  ret.time = new Date();
  data[name] = ret;
  mkdirs(dirname(runfile));
  writeJSON(runfile, data);
}

exports.record = record;
