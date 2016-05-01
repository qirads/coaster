'use strict';

module.exports = function(client) {
  var limiter = require('express-limiter')(null, client);
  var createError = require('http-errors');
  
  return limiter({
    lookup: ['connection.remoteAddress'],
    onRateLimited: function (req, res, next) {
      next(createError(429, 'Rate limit exceeded'));
    },
    total: 150,
    expire: 1000 * 60 * 60
  });
};