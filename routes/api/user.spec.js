/*global describe:false, it:false, expect:false*/

'use strict';

var request = require('request');

var app = require('../../lib/app');

var config = require('../../config');
var server = require('http').createServer(app);
var baseUrl = 'http://' + config.hostName + ':3000/api/v1/';

describe('users', function() {

  var requestOptions;

  describe('app spinup', function() {
    it('should be ok', function(done) {
      server.listen(3000);
      server.on('listening', function() {
        requestOptions = { url: baseUrl + 'sessions', json : true, body: { credentials: {} } };
        requestOptions.body.credentials.userName = 'testUser';
        requestOptions.body.credentials.password = 'testPassword';
        request.post(requestOptions, function(error, response) {
          requestOptions.url = baseUrl + 'users';
          requestOptions.headers = { Authorization: 'Bearer ' + response.body.token };
          done();
        });
      });
    });
  });

  describe('POST', function() {
        
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
    
    it('returns status code 201 with valid userName and password', function(done) {
      requestOptions.body.userName = 'ephemeral';
      requestOptions.body.password = 'ephemeral';
      
      request.post(requestOptions, function(error, response) {
        expect(response.body.token).toBeDefined();
        expect(response.statusCode).toBe(201);
        done();
      });
    });
    
  });
  
  describe('PATCH', function() {
    
    it('returns status code 400 if password is not specified', function() {
    });
    
  });
    
  describe('app spindown', function() {
    it('should be ok', function(done) {
      server.close();
      done();
    });
  });
  
});