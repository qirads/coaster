'use strict';

module.exports = function(app, config) {

  var mongoose = require('mongoose');
  var User = mongoose.model('User');
  var allowPatchOnly = require('./middleware/allowPatchOnly.middleware');
  var validate = require('./middleware/validate.middleware');
  var authenticate = require('./middleware/jwt.wrapper')(config);
  var allowAdminOnly = require('./middleware/allowAdminOnly.middleware');
    
  var validateCreate = validate([{
    name: 'userName',
    type: 'string',
    required: true
  }, {
    name: 'domain',
    type: 'string',
    allowedValues: User.schema.path('domain').enumValues    
  }, {
    name: 'isAdmin',
    type: 'boolean'
  }]);
  
  var validateUpdate = validate([{
    name: 'password',
    type: 'string'
  }]);
  
  var options = {
    name: 'users',
    private: ['salt', 'hash'],
    preMiddleware: [ authenticate ],
    preCreate: [ allowAdminOnly, validateCreate ],
    preUpdate: [ allowPatchOnly, validateUpdate ],
    preRemove: [ allowAdminOnly ]
  }

  return options;
      
};