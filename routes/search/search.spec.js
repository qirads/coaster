/*global describe:false, it:false, expect:false*/

'use strict';

var request = require('request');

var app = require('../../lib/app');
var errorHandler = require('../../lib/express-error-handler.wrapper')(app);
var server = require('http').createServer(app);
var baseUrl = process.env.COASTER_PATHS_HTTP + '/api/v1/';

describe('searches', function() {

  var requestOptions, adminToken;

  requestOptions = { url: baseUrl + 'searches', json : true, body: {} };
    
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
          requestOptions.url = baseUrl + 'searches';
          requestOptions.headers = { Authorization: 'Bearer ' + adminToken };
          done();
        });
      });
    });
  });

  describe('POST', function() {
    
    beforeEach(function() {
      requestOptions.body = {};
    });

    it('returns 201 when searching by demographics status', function(done) {
      requestOptions.body.criteria = ['demographics:verified'];
      
      request.post(requestOptions, function(error, response, body) {
        expect(response.statusCode).toBe(201);
        done();
      });
    });

  });
  
  describe('GET', function() {

    it('returns status code 401 without token', function(done) {
      done();
    });

  });
  
  describe('PATCH, DELETE', function() {
        
    it('returns status code 405', function(done) {
      done();
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