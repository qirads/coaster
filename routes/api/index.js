'use strict';

module.exports = function(config) {

  var express = require('express');
  var router = express.Router();
  var restify = require('express-restify-mongoose');
  var mongoose = require('mongoose');
  var User = mongoose.model('User');
  var Session = mongoose.model('Session');
  var auth = require('../auth.middleware')(config);
  var createError = require('http-errors');

  router.use(auth.authenticate());

  restify.serve(router, User, {
    prefix: '',
    preMiddleware: auth.authorize.isAdmin,
    private: ['salt', 'hash'],
    onError: function (err, req, res, next) { next(createError(err.statusCode)); }
  });

  restify.serve(router, Session, {
    prefix: '',
    preMiddleware: [
      function(req, res, next) {
        if (req.method != "GET") { next(createError(405, 'Method not allowed')); }
      },
      auth.authorize.isAdmin
    ],
    onError: function (err, req, res, next) { next(createError(err.statusCode)); }
  });
  
  return router;
  
};