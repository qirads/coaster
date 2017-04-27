'use strict';

module.exports = function(redis) {
  
  var jwt = require('express-jwt');
  var blacklist = require('./blacklist.wrapper')(redis);

  return jwt({
    requestProperty: 'auth',
    secret: process.env.COASTER_JWT_SECRETKEY,
    isRevoked: blacklist.isRevoked
  });
  
};