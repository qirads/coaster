'use strict';

module.exports = function(app, config) {

  var client = require('redis').createClient();
  var limiter = require('express-limiter')(null, client);
  var createError = require('http-errors');
  var passportWrapper = require('./middleware/passport.wrapper')(config);
  var allowPatchOnly = require('./middleware/allowPatchOnly.middleware');
  var validate = require('./middleware/validate.middleware');
  var mongoose = require('mongoose');
  var Session = mongoose.model('Session');
  var contextFilter = require('./middleware/contextFilter.filter');
  var authenticate = require('./middleware/jwt.wrapper')(config);
  var authorize = require('./middleware/authorize.middleware');
  var allowAdminOnly = require('./middleware/allowAdminOnly.middleware');
  
  var _ = require('lodash');
  
  var validateCreate = validate([{
    name: 'credentials',
    type: 'object',
    required: true,
    schema: [
      {
        name: 'userName',
        type: 'string',
        required: true
      },
      {
        name: 'password',
        type: 'string',
        required: true
      }
    ]
  }]);
  
  var validateUpdate = validate([{
    name: 'state',
    type: 'string',
    required: true,
    allowedValues: Session.schema.path('state').enumValues
  }]);

  var limiterWrapper = limiter({
    lookup: ['connection.remoteAddress'],
    onRateLimited: function (req, res, next) {
      next(createError(429, 'Too many tries'))
    },
    total: 10,
    expire: 1000 * 10
  });
      
  function addToken(req, res, next) {
    req.erm.result.generateJWT(function(err, token) {
      if (err) { return next(err); }
      if (req.erm.result.state === 'active') {
        req.erm.result.set('token', token, String, { strict: false });      
      }
      next();
    });
  }
  
  function logout(req, res, next) {
    if (req.erm.result.state === 'user-logged-out') {
      req.erm.result.revoke();
    }
    next();
  }  
  
  function checkState(req, res, next) {
    if (req.erm.document.state !== 'active') {
      return next(createError(400, 'Only active sessions can be modified.'));
    }
    next();
  }

  var options = {
    name: 'sessions',
    preMiddleware: (app.get('env') === 'development') ? [] : limiterWrapper,
    preCreate: [ validateCreate, passportWrapper.initialize(), passportWrapper.authenticate() ],
    postCreate: addToken,
    contextFilter: contextFilter,
    preRead: [ authenticate ],
    findOneAndUpdate: false,
    preUpdate: [ allowPatchOnly, authenticate, validateUpdate, checkState ],
    postUpdate: [ addToken, logout ],
    preRemove: [ authenticate, allowAdminOnly ]
  };  
    
  return options;
  
};