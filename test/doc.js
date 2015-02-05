var sinon = require('sinon');
var doc = require('../lib/doc');
var lnico = require('lnico');
var muk = require('muk');

describe('doc', function() {

  it('build', function() {
    lnico.build = function() {};
    var nicoBuild = sinon.spy(lnico, 'build');
    doc({
      build: true
    });
    nicoBuild.called.should.be.eql(true);
  });

  it('watch', function() {
    lnico.server = function() {};
    var server = sinon.spy(lnico, 'server');
    doc({
      watch: true
    });
    server.called.should.be.eql(true);
  });

  it('publish', function() {
    lnico.build = function() {};
    var mockUpload = {
      './upload': function() {}
    };
    var build = sinon.spy(lnico, 'build');
    var upload = sinon.spy(mockUpload, './upload');
    var doc = muk('../lib/doc', mockUpload);
    doc({
      publish: true
    });
    build.called.should.be.eql(true);
    upload.called.should.be.eql(true);
  });

  it('callback', function() {
    var callback = sinon.spy();
    doc({
      build: true
    }, callback);
    callback.called.should.be.eql(true);
  });

});
