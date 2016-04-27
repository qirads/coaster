'use strict';

module.exports = function(app, config) {

  var mongoose = require('mongoose');
  var Session = mongoose.model('Session');
  var client = require('redis').createClient();
  var limiter = require('express-limiter')(null, client);
  var createError = require('http-errors');
  var passportWrapper = require('./middleware/passport.wrapper')(config);
  var allowPatchOnly = require('./middleware/allowPatchOnly.middleware');
  var validate = require('./middleware/validate.middleware');
  var contextFilter = require('./middleware/contextFilter.filter');
  var authenticate = require('./middleware/jwt.wrapper')(config);
  var allowAdminOnly = require('./middleware/allowAdminOnly.middleware');
  var authorize = require('./middleware/authorize.middleware');
    
  var _ = require('lodash');
  
  var validateCreate = validate([{
    name: 'credentials',
    type: 'object',
    required: true,
    schema: [
      {
        name: 'userName',
        type: 'string',
        required: true
      },
      {
        name: 'password',
        type: 'string',
        required: true
      }
    ]
  }]);
  
  var validateUpdate = validate([{
    name: 'state',
    type: 'string',
    required: true,
    allowedValues: Session.schema.path('state').enumValues
  }]);

  var limiterWrapper = limiter({
    lookup: ['connection.remoteAddress'],
    onRateLimited: function (req, res, next) {
      next(createError(429, 'Too many tries'))
    },
    total: 10,
    expire: 1000 * 10
  });
  
  function updateTokens(req, res, next) {
    if (req.erm.result.state === 'open') {
      if (req.auth === undefined || req.auth.jti === req.params.id) {
        req.erm.result.generateJWT();
      }
    } else {
      req.erm.result.revoke();
    }
    next();
  }
  
  function revokeTokens(req, res, next) {
    req.erm.result.revoke();
    next();
  }
  
  var authorizeAccess = authorize(function(req) {
    return req.auth.hasAdminPrivileges || req.auth.jti === req.params.id;
  });

  var authorizeAdminUpdate = authorize(function(req) {
    return req.auth.hasAdminPrivileges || req.body.state.substr(0, 'admin'.length) !== 'admin';
  });
  
  function checkDocument(req, res, next) {
    if (req.erm.document.state !== 'open') {
      return next(createError(400, 'Only open sessions can be modified.'));
    }
    next();
  }  
  
  function updateTimestamps(req, res, next) {    
    if (req.body.state === 'open') {
      req.body.lastRefreshedAt = Date.now();
    } else {
      req.body.endedAt = Date.now();
    } 
    next();
  }

  var options = {
    name: 'sessions',
    preMiddleware: (app.get('env') === 'development') ? [] : limiterWrapper,
    preCreate: [ validateCreate, passportWrapper.initialize(), passportWrapper.authenticate() ],
    postCreate: [ updateTokens ],
    contextFilter: contextFilter,
    preRead: [ authenticate, authorizeAccess ],
    findOneAndUpdate: false,
    preUpdate: [
      authenticate, authorizeAccess, allowPatchOnly, validateUpdate, authorizeAdminUpdate,
      checkDocument, updateTimestamps
    ],
    postUpdate: [ updateTokens ],
    preRemove: [ authenticate, allowAdminOnly ],
    postRemove: [ revokeTokens ],
  };  
    
  return options;
  
};