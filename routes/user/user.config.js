'use strict';

module.exports = function(clients) {

  var User = clients.mongoose.model('User');
  var createError = require('http-errors');
  var allowPatchOnly = require('../common/allowMethods.middleware')('PATCH');
  var validate = require('../common/validate.middleware');
  var userValidations = require('./user.validations.js');
  var authenticate = require('../common/jwt.wrapper')(clients.redis);
  var allowAdminOnly = require('../common/allowAdminOnly.middleware');
  var authorize = require('../common/authorize.middleware');
  
  function checkBody(req, res, next) {
    if ((!req.body.domain || req.body.domain === 'local') && !req.body.password) {
      return next(createError(400, 'Local accounts require passwords.'));
    }
    if (req.body.domain && req.body.domain !== 'local' && req.body.password) {
      return next(createError(400, 'Only local accounts use local passwords.'));
    }
    next();
  }
    
  var authorizeAccess = authorize(function(req) {
    return req.auth.hasAdminPrivileges || req.auth.sub === req.params.id;
  });
    
  function checkDocument(req, res, next) {
    if (req.erm.document && req.erm.document.domain !== 'local' && req.body.password) {
      return next(createError(400, 'Only local passwords can be modified.'));
    }
    next();
  }
  
  function updateTokens(req, res, next) {
    if (req.body.password !== undefined && req.auth.sub === req.params.id) {
      req.erm.result.updateTokens(req.auth.jti);
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
    preCreate: [
      allowAdminOnly,
      validate(userValidations.create),
      checkBody
    ],
    preRead: [ authorizeAccess ],
    findOneAndUpdate: false,
    preUpdate: [
      authorizeAccess,
      allowPatchOnly,
      validate(userValidations.update),
      checkDocument
    ],
    postUpdate: [ updateTokens ],
    preRemove: [ allowAdminOnly ],
    postRemove: [ purgeTokens ]
  }

  return options;
      
};