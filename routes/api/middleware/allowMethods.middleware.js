'use strict';

var createError = require('http-errors');
var _ = require('lodash');
    
function allowMethods(methods) {
  return function(req, res, next) {
    if (!_.includes(methods, req.method)) {
      return next(createError(405, 'Method not allowed'));
    }
    next();      
  }
}

module.exports = allowMethods;