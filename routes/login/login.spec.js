/*global describe:false, it:false, expect:false*/

'use strict';

var request = require('request');

var app = require('../../lib/app');

var config = require('../../config');
var server = require('http').createServer(app);
var baseUrl = 'http://' + config.hostName + ':3000/login';

describe('login', function() {

  describe('app spinup', function() {
    it('should be ok', function(done) {
      server.listen(3000);
      server.on('listening', function() {
        app.spinUp();
        done();
      });
    });
  });

  describe('POST /', function() {
    
    var requestOptions = {
      url: baseUrl,
      json : true,
      body: {
        credentials : {
          userName : '',
          password : ''
        }
      }
    };
    
    it('returns status code 401 on wrong password', function(done) {

      requestOptions.body.credentials.userName = 'yaacov.rydzinski';
      requestOptions.body.credentials.password = 'wrong_password';
          
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(401);
        done();
      });
      
    });

    it('returns status code 401 on bad user name', function(done) {

      requestOptions.body.credentials.userName = 'bad_user_name';
      requestOptions.body.credentials.password = 'dummy_password';
      
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(401);
        done();
      });
          
    });

    it('returns status code 200 with good credentials', function(done) {

      requestOptions.body.credentials.userName = 'testUser';
      requestOptions.body.credentials.password = 'testPassword';
      
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(200);
        done();
      });
          
    });
    
  });
    
  describe('app spindown', function() {
    it('should be ok', function(done) {
      app.spinDown();
      server.close();
      done();
    });
  });
  
});