'use strict';

module.exports = function(config) {

  var express = require('express');
  var router = express.Router();
  var passportWrapper = require('./passport.wrapper')(config);

  var client = require('redis').createClient();
  var limiter = require('express-limiter')(router, client);
  var createError = require('http-errors');

  router.use(limiter({
    lookup: ['connection.remoteAddress'],
    onRateLimited: function (req, res, next) {
      next(createError(429, 'Too many tries'))
    },
    total: 10,
    expire: 1000 * 10
  }));

  router.use(passportWrapper.initialize());

  /* POST login. */

  router.post('/', passportWrapper.authenticate());
  return router;

};