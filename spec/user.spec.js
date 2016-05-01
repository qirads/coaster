/*global describe:false, it:false, expect:false*/

'use strict';

var request = require('request');

var app = require('../lib/app');
var errorHandler = require('../lib/express-error-handler.wrapper')(app);
var config = require('../config');
var server = require('http').createServer(app);
var baseUrl = 'http://' + config.hostName + ':3000/api/v1/';

describe('users', function() {

  var requestOptions, adminToken;

  describe('app spinup', function() {
    it('should be ok', function(done) {
      app.use(errorHandler(server));
      server.listen(3000);
      server.on('listening', function() {
        requestOptions = { url: baseUrl + 'sessions', json : true, body: { credentials: {} } };
        requestOptions.body.credentials.userName = config.credentials.admin.userName;
        requestOptions.body.credentials.password = config.credentials.admin.password;
        request.post(requestOptions, function(error, response, body) {
          adminToken = body.token;
          requestOptions.url = baseUrl + 'users';
          requestOptions.headers = { Authorization: 'Bearer ' + adminToken };
          done();
        });
      });
    });
  });

  describe('POST, PATCH, GET, DELETE', function() {
    
    var localUserId, nonLocalUserId;
    
    beforeEach(function() {
      requestOptions.body = {};
    });
    
    it('returns status code 400 on missing userName', function(done) {
      requestOptions.body.password = 'ephemeral';
      
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });
    
    it('returns status code 400 on wrong userName type', function(done) {
      requestOptions.body.userName = 5;
      requestOptions.body.password = 'ephemeral';
          
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('returns status code 400 on missing password', function(done) {
      requestOptions.body.userName = 'ephemeral';
          
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });
    
    it('returns status code 400 on wrong password type', function(done) {
      requestOptions.body.userName = 'ephemeral';
      requestOptions.body.password = 5;
          
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('returns status code 400 if supplied invalid domain', function(done) {
      requestOptions.body.userName = 'ephemeral';
      requestOptions.body.domain = 'test';
          
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

    it('returns status code 400 if supplied password for non-local accounts', function(done) {
      requestOptions.body.userName = 'ephemeral';
      requestOptions.body.password = 'ephemeral';
      requestOptions.body.domain = 'CORP';
          
      request.post(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });
    
    it('returns status code 201 with valid userName and password', function(done) {
      requestOptions.body.userName = 'ephemeral';
      requestOptions.body.password = 'ephemeral';
      
      request.post(requestOptions, function(error, response, body) {
        localUserId = body._id;
        expect(response.statusCode).toBe(201);
        done();
      });
    });

    it('returns status code 201 with valid non-local userName', function(done) {
      requestOptions.body.userName = 'ephemeral2';
      requestOptions.body.domain = 'CORP';
      
      request.post(requestOptions, function(error, response, body) {
        nonLocalUserId = body._id;
        expect(response.statusCode).toBe(201);
        done();
      });
    });

    it('returns status code 200 on PATCH for local user', function(done) {
      requestOptions.url = baseUrl + 'users/' + localUserId;
      requestOptions.body.password = 'veryephemeral';
      request.patch(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(200);
        done();
      });      
    });

    it('returns status code 200 on GET', function(done) {      
      requestOptions.url = baseUrl + 'users/' + localUserId;
      request.get(requestOptions, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it('returns status code 401 if user not activated', function(done) {
      requestOptions.url = baseUrl + 'sessions';
      requestOptions.body.credentials = { userName: 'ephemeral', password: 'veryephemeral' };
      request.post(requestOptions, function(error, response, body) {
        expect(response.statusCode).toBe(401);
        done();
      });
    });

    it('returns status code 200 on PATCH for activation', function(done) {      
      requestOptions.url = baseUrl + 'users/' + localUserId;
      requestOptions.body = { activated: true };
      request.patch(requestOptions, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it('returns status code 200 on PATCH for local user using local user credentials', function(done) {
      requestOptions.url = baseUrl + 'sessions';
      requestOptions.body.credentials = { userName: 'ephemeral', password: 'veryephemeral' };
      request.post(requestOptions, function(error, response, body) {
        requestOptions.url = baseUrl + 'users/' + localUserId;
        requestOptions.headers = { Authorization: 'Bearer ' + body.token };
        requestOptions.body = { password: 'veryephemeral2' };
        request.patch(requestOptions, function(error, response) {
          expect(response.statusCode).toBe(200);
          done();
        });
      });
    });

    it('returns status code 403 on PATCH for non-local user using local user credentials', function(done) {
      requestOptions.url = baseUrl + 'users/' + nonLocalUserId;
      requestOptions.body.password = 'veryephemeral';
      request.patch(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(403);
        done();
      });      
    });

    it('returns status code 400 on PATCH for non-local user', function(done) {
      requestOptions.headers = { Authorization: 'Bearer ' + adminToken };
      requestOptions.body.password = 'veryephemeral';
      request.patch(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });      
    });
    
    it('returns status code 204 on DELETE for local user', function(done) {
      requestOptions.url = baseUrl + 'users/' + localUserId;
      request.del(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(204);
        done();
      });      
    });

    it('returns status code 204 on DELETE for non-local user', function(done) {
      requestOptions.url = baseUrl + 'users/' + nonLocalUserId;
      request.del(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(204);
        done();
      });      
    });
    
  });
    
  describe('app spindown', function() {
    it('should be ok', function(done) {
      server.close(function() {
        done();        
      });
    });
  });
  
});