'use strict';

var client = require('redis').createClient();
var createError = require('http-errors');

module.exports = function(app) {
  var limiter = require('express-limiter')(app, client);
  return limiter({
    lookup: ['connection.remoteAddress'],
    onRateLimited: function (req, res, next) {
      next(createError(429, 'Rate limit exceeded'));
    },
    total: 150,
    expire: 1000 * 60 * 60
  });
};