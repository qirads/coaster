'use strict';

module.exports = function(app, config) {

  var express = require('express');
  var router = express.Router();
  var restify = require('express-restify-mongoose');
  var mongoose = require('mongoose');
  var User = mongoose.model('User');
  var Session = mongoose.model('Session');
  var userConfig = require('./user.config')(app, config);
  var sessionConfig = require('./session.config')(app, config);
  var createError = require('http-errors');  
  var _ = require('lodash');
  
  var defaults = {
    prefix: '',
    allowRegex: false,
    private: ['__v'],
    onError: function (err, req, res, next) { next(createError(err.statusCode)); }    
  };
          
  restify.serve(router, User, _.merge({}, defaults, userConfig, customizer));
  restify.serve(router, Session, _.merge({}, defaults, sessionConfig, customizer));
  
  router.use(function(req, res, next) {
    next(createError(404));
  });

  return router;
  
  function customizer(a, b) {
    return (_.isArray(a)) ? a.concat(b) : undefined;
  }
    
};