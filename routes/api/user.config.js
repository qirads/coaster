'use strict';

module.exports = function(app, config) {

  var mongoose = require('mongoose');
  var User = mongoose.model('User');
  var createError = require('http-errors');
  var allowPatchOnly = require('./middleware/allowPatchOnly.middleware');
  var validate = require('./middleware/validate.middleware');
  var authenticate = require('./middleware/jwt.wrapper')(config);
  var allowAdminOnly = require('./middleware/allowAdminOnly.middleware');
    
  var validateCreate = validate([{
    name: 'userName',
    type: 'string',
    required: true
  }, {
    name: 'password',
    type: 'string'
  }, {
    name: 'domain',
    type: 'string',
    allowedValues: User.schema.path('domain').enumValues    
  }, {
    name: 'isAdmin',
    type: 'boolean'
  }]);

  function checkBody(req, res, next) {
    if ((!req.body.domain || req.body.domain === 'local') && !req.body.password) {
      return next(createError(400, 'Local accounts require passwords.'));
    }
    if (req.body.domain && req.body.domain !== 'local' && req.body.password) {
      return next(createError(400, 'Only local accounts use local passwords.'));
    }
    next();
  }
  
  var validateUpdate = validate([{
    name: 'password',
    type: 'string'
  }]);
  
  function checkDocument(req, res, next) {
    if (req.erm.document && req.erm.document.domain !== 'local' && req.body.password) {
      return next(createError(400, 'Only local passwords can be modified.'));
    }
    next();
  }
  
  var options = {
    name: 'users',
    private: ['salt', 'hash'],
    preMiddleware: [ authenticate ],
    preCreate: [ allowAdminOnly, validateCreate, checkBody ],
    findOneAndUpdate: false,
    preUpdate: [ allowPatchOnly, validateUpdate, checkDocument ],
    preRemove: [ allowAdminOnly ]
  }

  return options;
      
};