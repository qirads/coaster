'use strict';

module.exports = function(config) {

  var express = require('express');
  var router = express.Router();
  var auth = require('../auth.middleware')(config);
  var mongoose = require('mongoose');
  var Session = mongoose.model('Session');

  router.use(auth.authenticate());

  /* POST refresh. */

  router.post('/', function(req, res, next) {
    Session.findById(req.auth.jti, function (err, Session) {
      if (err) { return next(err); }
      Session.generateJWT(function(err, jwt) {
        if (err) { return next(err); }
        return res.status(201).json({ token: jwt });
      });
    });
  });

  return router;
  
};