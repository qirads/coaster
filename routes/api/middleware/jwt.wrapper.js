'use strict';

module.exports = function(config) {
  
  var jwt = require('express-jwt');
  var blacklist = require('express-jwt-blacklist');

  blacklist.configure({
    tokenId: 'sub',
    indexBy: 'jti',
    store: { type: 'redis' }
  });
  
  return jwt({
    requestProperty: 'auth',
    secret: config.jwts.secretKey,
    isRevoked: blacklist.isRevoked
  });
  
};