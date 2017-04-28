'use strict';

module.exports = function(clients) {

  var User = clients.mongoose.model('User');
  var createError = require('http-errors');
  var allowPatchOnly = require('../common/allowMethods.middleware')('PATCH');
  var userJoi = require('./user.joi.js');
  var authenticate = require('../common/jwt.wrapper')(clients.redis);
  var allowAdminOnly = require('../common/allowAdminOnly.middleware');
  var authorize = require('../common/authorize.middleware');

  var authorizeAccess = authorize(function(req) {
    return req.auth.hasAdminPrivileges || req.auth.sub === req.params.id;
  });

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
      userJoi.validatePreCreate
    ],
    preRead: [ authorizeAccess ],
    findOneAndUpdate: false,
    preUpdate: [
      authorizeAccess,
      allowPatchOnly,
      userJoi.validatePreUpdate
    ],
    postUpdate: [ updateTokens ],
    preRemove: [ allowAdminOnly ],
    postRemove: [ purgeTokens ]
  }

  return options;
      
};