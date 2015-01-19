var legorc = require('legorc');
var extend = require('extend');
var Package = require('lego-colorful').LegoPackage;

exports.getSourceFiles = function(root) {
  var pkg = new Package(root || process.cwd(), {
    moduleDir: legorc.get('install.path')
  });
  return Object.keys(pkg.files).map(function(file) {
    return file.replace(/\.js$/, '');
  });
};

exports.getDependencies = function(root) {
  var pkg = new Package(root || process.cwd(), {
    moduleDir: legorc.get('install.path')
  });

  var ret = {};
  var deps = extend({}, pkg.dependencies, pkg.devDependencies);
  for (var k in deps) {
    if (!deps.hasOwnProperty(k)) continue;
    var dep = deps[k];
    ret[dep.name] = dep.name + '/' + dep.version + '/' + dep.main;
  }
  return ret;
};
