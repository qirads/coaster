'use strict';

var createError = require('http-errors');
    
function allowPatchOnly(req, res, next) {
  if (req.method !== 'PATCH') {
    return next(createError(405, 'Method not allowed'));
  }
  next();      
}

module.exports = allowPatchOnly;