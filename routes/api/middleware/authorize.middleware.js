'use strict';
  
var createError = require('http-errors');
      
module.exports = function(authFn) {
  return function(req, res, next) {
    if (!authFn(req)) {
      next(createError(403, 'User \"' + req.auth.userName + '\" not authorized to access this resource.'))
    }
    next();
  };
};