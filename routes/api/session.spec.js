/*global describe:false, it:false, expect:false*/

'use strict';

var request = require('request');

var app = require('../../lib/app');
var errorHandler = require('../../lib/express-error-handler.wrapper')(app);
var config = require('../../config');
var server = require('http').createServer(app);
var baseUrl = 'http://' + config.hostName + ':3000/api/v1/';

describe('sessions', function() {

  var requestOptions;  
    
  describe('app spinup', function() {
    it('should be ok', function(done) {
      app.use(errorHandler(server));
      server.listen(3000);
      server.on('listening', function() {
        done();
      });
    });
  });

  describe('POST', function() {
    
    beforeEach(function() {
      requestOptions = { url: baseUrl + 'sessions', json : true, body: { credentials: {} } };
    });
    
    it('returns status code 400 on missing userName', function(done) {
      requestOptions.body.credentials.password = 'wrong_password';
      
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });
    
    it('returns status code 400 on wrong userName type', function(done) {
      requestOptions.body.credentials.userName = 5;
      requestOptions.body.credentials.password = 'wrong_password';
          
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('returns status code 400 on missing password', function(done) {
      requestOptions.body.credentials.userName = 'yaacov.rydzinski';
          
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });
    
    it('returns status code 400 on wrong password type', function(done) {
      requestOptions.body.credentials.userName = 'yaacov.rydzinski';
      requestOptions.body.credentials.password = 5;
          
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });
        
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

    it('returns status code 200 and token with good credentials', function(done) {
      requestOptions.body.credentials.userName = config.credentials.adminUserName;
      requestOptions.body.credentials.password = config.credentials.adminPassword;
      
      request.post(requestOptions, function(error, response, body) {
        expect(body.token).toBeDefined();
        expect(response.statusCode).toBe(201);
        done();
      });
    });
    
  });
  
  describe('PATCH', function() {
        
    beforeEach(function(done) {
      requestOptions = { url: baseUrl + 'sessions', json : true, body: {
        credentials: {
          userName: config.credentials.adminUserName,
          password: config.credentials.adminPassword
        }
      } };
      request.post(requestOptions, function(error, response, body) {
        requestOptions.url = requestOptions.url + '/' + body._id;
        requestOptions.body = {};
        requestOptions.headers = { Authorization: 'Bearer ' + body.token };
        done();
      });
    });
    
    it('returns status code 400 if state is not specified', function(done) {
      request.patch(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('returns status code 400 if state is not allowed value', function(done) {
      requestOptions.body = { state: 'foo' };
      request.patch(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('returns status code 200 and token if state is set to open', function(done) {
      requestOptions.body = { state: 'open' };
      request.patch(requestOptions, function(error, response, body) {
        expect(body.token).toBeDefined();
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it('returns status code 200 and no token if state is set to user-logged-out and token no longer works', function(done) {
      requestOptions.body = { state: 'user-logged-out' };
      request.patch(requestOptions, function(error, response, body) {
        expect(body.token).not.toBeDefined();
        expect(response.statusCode).toBe(200);
        requestOptions.body = { state: 'open' };
        request.patch(requestOptions, function(error, response, body) {
          expect(body.token).not.toBeDefined();
          expect(response.statusCode).toBe(401);
          done();
        });
      });
    });
    
  });
    
  describe('app spindown', function() {
    it('should be ok', function(done) {
      server.close();
      done();
    });
  });
  
});