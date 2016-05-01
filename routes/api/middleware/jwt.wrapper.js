'use strict';

module.exports = function(config, client) {
  
  var jwt = require('express-jwt');
  var blacklist = require('../../../lib/blacklist.wrapper')(client);
    
  return jwt({
    requestProperty: 'auth',
    secret: config.jwts.secretKey,
    isRevoked: blacklist.isRevoked
  });
  
};