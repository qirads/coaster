'use strict';

module.exports = function(app, config, clients) {

  var mongoose = require('mongoose');
  var Study = mongoose.model('Study');
  var createError = require('http-errors');
  var disallow = require('./middleware/allowMethods.middleware')();
  var validate = require('./middleware/validate.middleware');
  var contextFilter = require('./middleware/contextFilter.filter');
  var authenticate = require('./middleware/jwt.wrapper')(config, clients.redis);
  var allowAdminOnly = require('./middleware/allowAdminOnly.middleware');
  var authorize = require('./middleware/authorize.middleware');
  var parse = require('./middleware/parse.middleware');
  var _ = require('lodash');
  
  var validateCreate = validate([{
    name: 'criteria',
    type: ['string'],
    required: true
  },
  {
    name: 'pageSize',
    type: 'number'
  }]);
  
  function addUserId(req, res, next) {
    req.body.userId = req.auth.sub;
    req.body.createdAt = Date.now();    
    next();
  }
  
  function performInitialSearch(req, res, next) {
    Study.count(req.conditions, function(err, count) {
      if (err) { return next(err); }
      req.erm.result.set('count', count, { strict: false });
      Study.find(req.conditions, null, {
        limit: Math.min(config.resultLimit, req.body.pageSize)
      }, function(err, results) {
        if (err) { return next(err); }
        req.erm.result.set('results', results, { strict: false });
        next();
      });      
    });
  }

  function addResults(req, res, next) {
    if (req.params.id) {
      var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
      var pageSize = req.query.pageSize ? Math.min(config.resultLimit, req.query.pageSize) : config.resultLimit;
      Study.find(req.conditions, null, {
        skip: pageSize * pageNumber,
        limit: pageSize
      }, function(err, results) {
        if (err) { return next(err); }
        req.erm.result.results = results;
        next();
      });      
    } else {
      next();
    }
  }
  
  var options = {
    name: 'searches',
    preCreate: [ authenticate, validateCreate, addUserId, parse ],
    postCreate: [ performInitialSearch ],
    contextFilter: contextFilter,
    preRead: [ authenticate ],
    postRead: [ addResults ],
    preUpdate: [ disallow ],
    preRemove: [ disallow ],
  };  
    
  return options;
  
};