/*global describe:false, it:false, expect:false*/

'use strict';

var request = require('request');

var app = require('../lib/app');
var config = require('../config');
var server = require('http').createServer(app);
var baseUrl = 'http://' + config.hostName + ':3000/example-route';

describe('example-route', function() {

  describe('app spinup', function() {
    it('should be ok', function(done) {
      server.listen(3000);
      server.on('listening', function() {
        app.connect();
        done();
      });
    });
  });
    
  describe('POST /', function() {
    
    var requestOptions = {
      url: baseUrl,
      json : true,
      body: {
        stuff : {
          innerStuff1 : '',
          innerStuff2 : ''
        }
      }
    };
    
    it('returns status code 404 as this route does not exist', function(done) {
      requestOptions.body.stuff.innerStuff1 = 'dummyInnerStuff1';
      requestOptions.body.stuff.innerStuff2 = 'dummyInnerStuff2';
          
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(404);
        done();
      });
      
    });
  });
    
  describe('app spindown', function() {
    it('should be ok', function(done) {
      app.disconnect();
      server.close();
      done();
    });
  });

});