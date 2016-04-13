/*global describe:false, it:false, expect:false*/

'use strict';

var request = require('request');

var app = require('../../lib/app');

var config = require('../../config');
var server = require('http').createServer(app);
var baseUrl = 'http://' + config.hostName + ':3000/api/v1/sessions';

describe('sessions', function() {

  describe('app spinup', function() {
    it('should be ok', function(done) {
      server.listen(3000);
      server.on('listening', function() {
        done();
      });
    });
  });

  describe('POST /', function() {
    
    var requestOptions;
    
    beforeEach(function() {
      requestOptions = {
        url: baseUrl,
        json : true,
        body: {
          credentials : {}
        }
      };  
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
      requestOptions.body.credentials.userName = 'testUser';
      requestOptions.body.credentials.password = 'testPassword';
      
      request.post(requestOptions, function(error, response) {
        expect(response.body.token).toBeDefined();
        expect(response.statusCode).toBe(201);
        done();
      });
    });

    it('returns status code 400 if state is not specified', function(done) {
      requestOptions.body.credentials.userName = 'testUser';
      requestOptions.body.credentials.password = 'testPassword';
      
      request.post(requestOptions, function(error, response) {
        requestOptions.url = requestOptions.url + '/' + response.body._id;
        requestOptions.body = {};
        requestOptions.headers = { Authorization: 'Bearer ' + response.body.token };
        request.patch(requestOptions, function(error, response) {
          expect(response.statusCode).toBe(400);
          done();
        });
      });
    });

    it('returns status code 400 if status is not allowed value', function(done) {
      requestOptions.body.credentials.userName = 'testUser';
      requestOptions.body.credentials.password = 'testPassword';
      
      request.post(requestOptions, function(error, response) {
        requestOptions.url = requestOptions.url + '/' + response.body._id;
        requestOptions.body = { state: 'foo' };
        requestOptions.headers = { Authorization: 'Bearer ' + response.body.token };
        request.patch(requestOptions, function(error, response) {
          expect(response.statusCode).toBe(400);
          done();
        });
      });
    });

    it('returns status code 200 and token if state is set to active', function(done) {
      requestOptions.body.credentials.userName = 'testUser';
      requestOptions.body.credentials.password = 'testPassword';
      
      request.post(requestOptions, function(error, response) {
        requestOptions.url = requestOptions.url + '/' + response.body._id;
        requestOptions.body = { state: 'active' };
        requestOptions.headers = { Authorization: 'Bearer ' + response.body.token };
        request.patch(requestOptions, function(error, response) {
          expect(response.body.token).toBeDefined();
          expect(response.statusCode).toBe(200);
          done();
        });
      });
    });

    it('returns status code 200 and no token if state is set to user-logged-out', function(done) {
      requestOptions.body.credentials.userName = 'testUser';
      requestOptions.body.credentials.password = 'testPassword';
      
      request.post(requestOptions, function(error, response) {
        requestOptions.url = requestOptions.url + '/' + response.body._id;
        requestOptions.body = { state: 'user-logged-out' };
        requestOptions.headers = { Authorization: 'Bearer ' + response.body.token };
        request.patch(requestOptions, function(error, response) {
          expect(response.body.token).not.toBeDefined();
          expect(response.statusCode).toBe(200);
          requestOptions.body = { state: 'active' };
          request.patch(requestOptions, function(error, response) {
            expect(response.body.token).not.toBeDefined();
            expect(response.statusCode).toBe(401);
            done();
          });
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