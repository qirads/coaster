'use strict';

module.exports = function(app) {

  var restify = require('express-restify-mongoose');
  var createError = require('http-errors');  
  var _ = require('lodash');
  
  var defaults = {
    allowRegex: false,
    private: ['__v']    
  };
  
  defaults.onError = function (err, req, res, next) {
    next(createError(req.erm.statusCode));
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

  function serve(model, routeConfig) {
    restify.serve(app, model, _.merge({}, defaults, routeConfig, customizer));
  }

  var wrapper = {
    serve: serve
  };

  return wrapper;

  function customizer(a, b) {
    return (_.isArray(a)) ? a.concat(b) : undefined;
  }

};