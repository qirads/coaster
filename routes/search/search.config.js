'use strict';

module.exports = function(clients) {

  var Study = clients.mongoose.model('Study');
  var disallow = require('../common/allowMethods.middleware')();
  var validate = require('../common/validate.middleware');
  var contextFilter = require('../common/contextFilter.filter');
  var authenticate = require('../common/jwt.wrapper')(clients.redis);
  var allowAdminOnly = require('../common/allowAdminOnly.middleware');
  var authorize = require('../common/authorize.middleware');
  var parse = require('./parse.middleware');
  var _ = require('lodash');
  var resultLimit = require('../common/options').resultLimit;

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
      bool: { filter: req.conditions }
    }, {
      size: req.body.pageSize ? Math.min(resultLimit, req.body.pageSize) : resultLimit,
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
      var pageSize = req.query.pageSize ? Math.min(resultLimit, req.query.pageSize) : resultLimit;
      Study.search({
        bool: { filter: req.conditions }
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