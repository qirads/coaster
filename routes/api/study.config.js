'use strict';

module.exports = function(app, config, clients) {

  var mongoose = require('mongoose');
  var disallow = require('./middleware/allowMethods.middleware')();
  var authenticate = require('./middleware/jwt.wrapper')(config, clients.redis);
      
  var options = {
    name: 'studies',
    preCreate: [ disallow ],
    preRead: [ authenticate ],
    preUpdate: [ disallow ],
    preRemove: [ disallow ],
  };  
    
  return options;
  
};