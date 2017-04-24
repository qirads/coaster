'use strict';

module.exports = function(app, config, clients) {

  var express = require('express');
  var router = express.Router();
  var restify = require('express-restify-mongoose');
  var mongoose = require('mongoose');
  var createError = require('http-errors');  
  var _ = require('lodash');
  
  var defaults = {
    allowRegex: false,
    outputFn: outputFn,
    prefix: '',
    private: ['__v']    
  };
  
  defaults.onError = function (err, req, res, next) {
    next(createError(err.statusCode));
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

  function outputFn(req, res) {

    function renameId(result) {
      if (result._id) {
        result.id = result._id;
        delete result._id;
      }
    }

    if (req.erm.result) {
      if (_.isArray(req.erm.result)) {
        _.forEach(req.erm.result, renameId);
      } else {
        renameId(req.erm.result);
      }
      res.status(req.erm.statusCode).json(req.erm.result)
    } else {
      res.sendStatus(req.erm.statusCode)
    }
  }
    
};