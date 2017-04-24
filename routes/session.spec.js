/*global describe:false, it:false, expect:false*/

'use strict';

var request = require('request');

var app = require('../lib/app');
var errorHandler = require('../lib/express-error-handler.wrapper')(app);
var config = require('../config');
var server = require('http').createServer(app);
var baseUrl = 'http://' + config.hostName + ':3000/api/v1/';

describe('sessions', function() {

  var requestOptions, adminSessionId, adminToken, nonAdminUserId, nonAdminSessionId, nonAdminToken;

  requestOptions = { url: baseUrl + 'sessions', json : true, body: {} };
    
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
      requestOptions.body = { credentials: {} };
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
    
    it('returns status code 201 and token with good credentials', function(done) {
      requestOptions.body.credentials.userName = config.credentials.admin.userName;
      requestOptions.body.credentials.password = config.credentials.admin.password;
      request.post(requestOptions, function(error, response, body) {
        expect(body.token).toBeDefined();
        adminSessionId = body.id;
        adminToken = body.token;
        requestOptions.headers = { Authorization: 'Bearer ' + adminToken };
        expect(response.statusCode).toBe(201);
        requestOptions.url = baseUrl + 'users';
        requestOptions.body = { userName: 'ephemeral', password: 'ephemeral', activated: true };
        request.post(requestOptions, function(error, response, body) {
          expect(response.statusCode).toBe(201);
          nonAdminUserId = body.id;
          delete requestOptions.headers;
          requestOptions.url = baseUrl + 'sessions';
          requestOptions.body = { credentials: { userName: 'ephemeral', password: 'ephemeral' } };
          request.post(requestOptions, function(error, response, body) {
            expect(response.statusCode).toBe(201);
            nonAdminSessionId = body.id;
            nonAdminToken = body.token;
            done();
          });
        });
      });
    });
        
  });
  
  describe('GET', function() {

    it('returns status code 401 without token', function(done) {
      requestOptions.url = baseUrl + 'sessions' + '/' + adminSessionId;
      delete requestOptions.body;
      request.get(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(401);
        done();
      });
    });

    it('returns status code 403 for admin session using non-admin token', function(done) {
      requestOptions.headers = { Authorization: 'Bearer ' + nonAdminToken };
      requestOptions.url = baseUrl + 'sessions' + '/' + adminSessionId;
      request.get(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(403);
        done();
      });
    });

    it('returns status code 200 for non-admin session using non-admin token', function(done) {
      requestOptions.headers = { Authorization: 'Bearer ' + nonAdminToken };
      requestOptions.url = baseUrl + 'sessions' + '/' + nonAdminSessionId;
      request.get(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it('returns status code 200 for non-admin session using admin token', function(done) {
      requestOptions.headers = { Authorization: 'Bearer ' + adminToken };
      requestOptions.url = baseUrl + 'sessions' + '/' + nonAdminSessionId;
      request.get(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

  });
  
  describe('PATCH', function() {
        
    it('returns status code 401 if no token is specified', function(done) {
      delete requestOptions.headers;
      requestOptions.body = {};
      request.patch(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(401);
        done();
      });
    });

    it('returns status code 403 for admin session with non-Admin token', function(done) {
      requestOptions.headers = { Authorization: 'Bearer ' + nonAdminToken };
      requestOptions.url = baseUrl + 'sessions' + '/' + adminSessionId;
      request.patch(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(403);
        done();
      });
    });

    it('returns status code 400 if state is not specified', function(done) {
      requestOptions.headers = { Authorization: 'Bearer ' + adminToken };
      requestOptions.url = baseUrl + 'sessions' + '/' + nonAdminSessionId;
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
    
    it('returns status code 200 if state is set to open', function(done) {
      requestOptions.body = { state: 'open' };
      request.patch(requestOptions, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it('returns status code 200 and token if state is set to open and session is for current user', function(done) {
      requestOptions.headers = { Authorization: 'Bearer ' + nonAdminToken };
      requestOptions.body = { state: 'open' };
      request.patch(requestOptions, function(error, response, body) {
        expect(body.token).toBeDefined();
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it('returns status code 401 and no token if state is set to user-logged-out and token no longer works', function(done) {
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
      requestOptions.headers = { Authorization: 'Bearer ' + adminToken };
      requestOptions.url = baseUrl + 'users/' + nonAdminUserId;
      delete requestOptions.body;
      request.del(requestOptions, function(error, response, body) {
        expect(response.statusCode).toBe(204);
        server.close(function() {
          done();
       });
      });
    });
  });
    
});