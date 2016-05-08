'use strict';

module.exports = function(app, config, clients) {

  var express = require('express');
  var router = express.Router();
  var restify = require('express-restify-mongoose');
  var mongoose = require('mongoose');
  var createError = require('http-errors');  
  var _ = require('lodash');
  
  var defaults = {
    prefix: '',
    allowRegex: false,
    private: ['__v']    
  };
  
  if (app.get('env') !== 'development') {
    defaults.onError = function (err, req, res, next) {
      next(createError(err.statusCode));
    }
  }
  
  _.forEach(['User', 'Session', 'Search', 'Study'], function(model) {
    restify.serve(
      router,
      mongoose.model(model),
      _.merge({}, defaults, require('./' + model.toLowerCase() + '.config')(app, config, clients), customizer));    
  });
  
  router.use(function(req, res, next) {
    next(createError(404));
  });

  return router;
  
  function customizer(a, b) {
    return (_.isArray(a)) ? a.concat(b) : undefined;
  }
    
};