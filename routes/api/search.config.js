'use strict';

module.exports = function(app, config, clients) {

  var mongoose = require('mongoose');
  var Study = mongoose.model('Study');
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
  }, {
    name: 'pageSize',
    type: 'number'
  }]);
  
  function addUserId(req, res, next) {
    req.body.userId = req.auth.sub;
    req.body.createdAt = Date.now();
    next();
  }

  function performInitialSearch(req, res, next) {
    Study.search({
      bool: { must: req.conditions }
    }, {
      size: req.body.pageSize ? Math.min(config.resultLimit, req.body.pageSize) : config.resultLimit,
      from: 0,
      sort: [{ timestamp: 'desc' }]
    }, function(err, results) {
      if (err) { return next(err); }
      req.body.count = results.hits.total;
      req.results = _.map(results.hits.hits, function(hit) {
        return _.assign(hit._source, { _id: hit._id });
      });
      next();
    });
  }
  
  function addInitialResults(req, res, next) {
    req.erm.result.set('results', req.results, { strict: false });
    if (req.warnings) {
      req.erm.result.set('warnings', req.warnings, { strict: false });
    }
    next();
  }
  
  function getCriteria(req, res, next) {
    req.body.criteria = req.erm.result.criteria;
    next();
  }

  function addResults(req, res, next) {
    if (req.params.id) {
      var pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
      var pageSize = req.query.pageSize ? Math.min(config.resultLimit, req.query.pageSize) : config.resultLimit;
      Study.search({
        bool: { must: req.conditions }
      }, {
        size: pageSize,
        from: pageSize * pageNumber + 1,
        sort: [{ timestamp: 'desc' }]
      }, function(err, results) {
        if (err) { return next(err); }
        req.erm.result.results = _.map(results.hits.hits, function(hit) {
          return _.assign(hit._source, hit._id);
        });
        next();
      });      
    } else {
      next();
    }
  }
  
  var options = {
    name: 'searches',
    preCreate: [ authenticate, validateCreate, addUserId, parse, performInitialSearch ],
    postCreate: [ addInitialResults ],
    contextFilter: contextFilter,
    preRead: [ authenticate ],
    postRead: [ getCriteria, parse, addResults ],
    preUpdate: [ disallow ],
    preRemove: [ disallow ],
  };  
    
  return options;
  
};