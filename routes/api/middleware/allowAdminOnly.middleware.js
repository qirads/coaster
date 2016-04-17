'use strict';

var authorize = require('./authorize.middleware');

var allowAdminOnly = authorize(function(req) {
  return req.auth.hasAdminPrivileges;
});

module.exports = allowAdminOnly;