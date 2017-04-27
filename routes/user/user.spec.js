/*global describe:false, it:false, expect:false*/

'use strict';

var request = require('request');
var app = require('../../lib/app');
var errorHandler = require('../../lib/express-error-handler.wrapper')(app);
var server = require('http').createServer(app);
var baseUrl = process.env.COASTER_PATHS_HTTP + '/api/v1/';

describe('users', function() {

  var requestOptions, adminToken, localUserId, localUserToken, nonLocalUserId;;

  describe('app spinup', function() {
    it('should be ok', function(done) {
      app.use(errorHandler(server));
      server.listen(3000);
      server.on('listening', function() {
        requestOptions = { url: baseUrl + 'sessions', json : true, body: { credentials: {} } };
        requestOptions.body.credentials.userName = process.env.COASTER_CREDENTIALS_ADMIN_USERNAME;
        requestOptions.body.credentials.password = process.env.COASTER_CREDENTIALS_ADMIN_PASSWORD;
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
        localUserId = body.id;
        expect(response.statusCode).toBe(201);
        done();
      });
    });

    it('returns status code 201 with valid non-local userName', function(done) {
      requestOptions.body.userName = 'ephemeral2';
      requestOptions.body.domain = 'CORP';
      
      request.post(requestOptions, function(error, response, body) {
        nonLocalUserId = body.id;
        expect(response.statusCode).toBe(201);
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

  });

  describe('GET', function() {
    
    it('returns status code 200', function(done) {
      requestOptions.url = baseUrl + 'users/' + localUserId;
      request.get(requestOptions, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });
    
  });

  describe('PATCH', function() {
        
    beforeEach(function() {
      requestOptions.body = {};
    });
    
    it('returns status code 200 on PATCH for local user', function(done) {
      requestOptions.url = baseUrl + 'users/' + localUserId;
      requestOptions.body = { password: 'veryephemeral', activated: true };
      request.patch(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(200);
        done();
      });      
    });
    
    it('returns status code 403 on PATCH for non-local user using local user credentials', function(done) {
      requestOptions.url = baseUrl + 'sessions';
      requestOptions.body.credentials = { userName: 'ephemeral', password: 'veryephemeral' };
      request.post(requestOptions, function(error, response, body) {
        requestOptions.url = baseUrl + 'users/' + nonLocalUserId;
        localUserToken = body.token;
        requestOptions.headers = { Authorization: 'Bearer ' + localUserToken };
        requestOptions.body = { password: 'veryephemeral2' };
        request.patch(requestOptions, function(error, response, body) {
          expect(response.statusCode).toBe(403);
          done();
        });
      });
    });

    it('returns status code 200 on PATCH for local user using local user credentials', function(done) {
      setTimeout(function() {
        requestOptions.url = baseUrl + 'users/' + localUserId;
        requestOptions.body = { password: 'veryephemeral2' };
        request.patch(requestOptions, function(error, response, body) {
          expect(response.statusCode).toBe(200);
          expect(body.token).toBeDefined();
          expect(body.token).not.toBe(localUserToken);
          var oldLocalUserToken = localUserToken;
          localUserToken = body.token;
          requestOptions.headers = { Authorization: 'Bearer ' + oldLocalUserToken };
          requestOptions.url = baseUrl + 'users/' + localUserId;
          request.get(requestOptions, function(error, response, body) {
            expect(response.statusCode).toBe(401);
            requestOptions.headers = { Authorization: 'Bearer ' + localUserToken };
            requestOptions.url = baseUrl + 'users/' + localUserId;
            request.get(requestOptions, function(error, response) {
              expect(response.statusCode).toBe(200);
              done();
            });
          });
        });
      }, 1000);
    });

    it('returns status code 400 for non-local user if modifying password', function(done) {
      requestOptions.url = baseUrl + 'users/' + nonLocalUserId;
      requestOptions.headers = { Authorization: 'Bearer ' + adminToken };
      requestOptions.body.password = 'veryephemeral';
      request.patch(requestOptions, function(error, response) {
        expect(response.statusCode).toBe(400);
        done();
      });
    });

  });

  describe('DELETE', function() {
    
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