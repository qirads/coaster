'use strict';

module.exports = function(client) {

  var blacklist = require('express-jwt-blacklist');
  
  blacklist.configure({
    tokenId: 'sub',
    indexBy: 'jti',
    store: { type: 'redis', client: client }
  });
    
  return blacklist;
  
};