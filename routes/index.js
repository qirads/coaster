'use strict';

module.exports = function(app, config, clients) {

  var router = require('express').Router();
  var restify = require('express-restify-mongoose');
  var createError = require('http-errors');  
  var _ = require('lodash');
  
  var defaults = {
    allowRegex: false,
    private: ['__v']    
  };
  
  defaults.onError = function (err, req, res, next) {
    next(createError(err.statusCode));
  };

  defaults.outputFn = function(req, res) {

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
  };

  // setup api routes
  _.forEach(['user', 'session', 'study', 'search'], function(endpoint) {
    restify.serve(
      app,
      require('./' + endpoint + '.model')(config, clients),
      _.merge({}, defaults, require('./' + endpoint + '.config')(app, config, clients), customizer));
  });
  
  // return 404 for any unmatched API routes
  app.use('/api', function(req, res, next) {
    next(createError(404));
  });

  // redirect any unmatched routes to root
  app.use(function(req, res) {
    res.redirect(301, '/');
  });

  function customizer(a, b) {
    return (_.isArray(a)) ? a.concat(b) : undefined;
  }

};