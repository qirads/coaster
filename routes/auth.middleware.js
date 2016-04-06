'use strict';

module.exports = function(config) {
  
  var jwt = require('express-jwt');
  var blacklist = require('express-jwt-blacklist');
  var createError = require('http-errors');

  blacklist.configure({
    tokenId: 'sub',
    indexBy: 'jti',
    store: { type: 'redis' }
  });
  
  var auth = {
    authenticate: authenticate,
    isAdmin: isAdmin,
    revoke: revoke
  };
  
  function authenticate() {
    return jwt({
      requestProperty: 'auth',
      secret: config.jwts.secretKey,
      isRevoked: blacklist.isRevoked
    });
  }
  
  function isAdmin() {
    return function(req, res, next) {
      if (!req.auth.isAdmin) {
        next(createError(403, 'User \"' + req.auth.userName + '\" not authorized to access this resource.'))
      }
      next();
    };
  }
  
  function revoke() {
    return function(req, res, next) {
      blacklist.revoke(req.auth);
      next();
    };
  }
  
  return auth;
  
};