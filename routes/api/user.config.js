'use strict';

module.exports = function(app, config) {

  var mongoose = require('mongoose');
  var User = mongoose.model('User');
  var createError = require('http-errors');
  var allowPatchOnly = require('./middleware/allowPatchOnly.middleware');
  var validate = require('./middleware/validate.middleware');
  var authenticate = require('./middleware/jwt.wrapper')(config);
  var allowAdminOnly = require('./middleware/allowAdminOnly.middleware');
  var authorize = require('./middleware/authorize.middleware');
        
  var validateCreate = validate([{
    name: 'userName',
    type: 'string',
    required: true
  }, {
    name: 'password',
    type: 'string'
  }, {
    name: 'domain',
    type: 'string',
    allowedValues: User.schema.path('domain').enumValues    
  }, {
    name: 'isAdmin',
    type: 'boolean'
  }, {
    name: 'activated',
    type: 'boolean'
  }]);

  function checkCreateBody(req, res, next) {
    if ((!req.body.domain || req.body.domain === 'local') && !req.body.password) {
      return next(createError(400, 'Local accounts require passwords.'));
    }
    if (req.body.domain && req.body.domain !== 'local' && req.body.password) {
      return next(createError(400, 'Only local accounts use local passwords.'));
    }
    next();
  }

  function checkUpdateBody(req, res, next) {
    if (req.body.activated !== undefined && req.auth.sub === req.params.id) {
      return next(createError(400, 'A user cannot activate or deactivate herself.'));
    }
    next();
  }
    
  var authorizeAccess = authorize(function(req) {
    return req.auth.hasAdminPrivileges || req.auth.sub === req.params.id;
  });
  
  var validateUpdate = validate([{
    name: 'password',
    type: 'string'
  },{
    name: 'activated',
    type: 'boolean'
  }
  ]);
    
  function checkDocument(req, res, next) {
    if (req.erm.document && req.erm.document.domain !== 'local' && req.body.password) {
      return next(createError(400, 'Only local passwords can be modified.'));
    }
    next();
  }
  
  function updateTokens(req, res, next) {
    if (req.body.password !== undefined && req.auth.sub === req.params.id) {
      req.erm.result.generateJWT(req.auth.jti);
      req.erm.result.purge();
    }
    next();
  }
  
  function purgeTokens(req, res, next) {
    req.erm.result.purge();
    next();
  }
    
  var options = {
    name: 'users',
    private: ['salt', 'hash'],
    preMiddleware: [ authenticate ],
    preCreate: [ allowAdminOnly, validateCreate, checkCreateBody ],
    findOneAndUpdate: false,
    preRead: [ authorizeAccess ],
    preUpdate: [ authorizeAccess, allowPatchOnly, validateUpdate, checkUpdateBody, checkDocument ],
    postUpdate: [ updateTokens ],
    preRemove: [ allowAdminOnly ],
    postRemove: [ purgeTokens ]
  }

  return options;
      
};