'use strict';

module.exports = function(app, config) {

  var authenticate = require('./middleware/jwt.wrapper')(config);
  var authorize = require('./middleware/authorize.middleware');
    
  var options = {
    name: 'users',
    private: ['salt', 'hash'],
    preMiddleware: [
      authenticate,
      authorize(function(req) { return req.auth.isAdmin; })
    ]
  }

  return options;
      
};