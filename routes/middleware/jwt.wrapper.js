'use strict';

module.exports = function(config, redis) {
  
  var jwt = require('express-jwt');
  var blacklist = require('../blacklist.wrapper')(redis);

  return jwt({
    requestProperty: 'auth',
    secret: config.jwts.secretKey,
    isRevoked: blacklist.isRevoked
  });
  
};