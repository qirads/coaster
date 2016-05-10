'use strict';

var debug = require('debug')('coaster:error');

var errorHandler = require('express-error-handler');

module.exports = function(app) {

  return function(server) {
    return errorHandler({
      server: server,
      serializer: serializer
    });
  };
  
  function serializer(err) {
    var body = {
      status: err.status,
      message: err.message
    };
    if (errorHandler.isClientError(err.status)) {
      ['code', 'name', 'type', 'details'].forEach(function(prop) {
        if (err[prop]) {
          body[prop] = err[prop];
        }
      });
      if (app.get('env') === 'development') {
        body.stack = err.stack;
        debug(err);
        if (err.details) {
          debug('details:');
          debug(err.details);
        }
      }
    } else {
      if (app.get('env') !== 'development') {
        body.message = 'Internal server error';
      }
      debug(err);
    }
    return body;
  }

};