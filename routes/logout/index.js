'use strict';

module.exports = function(config) {
  
  var express = require('express');
  var router = express.Router();
  var auth = require('../auth.middleware')(config);
  var mongoose = require('mongoose');
  var Session = mongoose.model('Session');
  
  router.use(auth.authenticate());
  
  /* POST logout. */
  
  router.post('/', auth.revoke());
  
  router.post('/', function(req, res, next) {
    Session.findByIdAndUpdate(req.auth.jti, {
      status: (req.body.type === 'logout') ? 'user-logged-out' : 'user-timed-out'
    }, { new: true }, function (err, Session) {
      if (err) { return next(err); }
      return res.status(200).json(Session);
    });
  });
  
  return router;
  
};