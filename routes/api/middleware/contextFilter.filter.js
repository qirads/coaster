'use strict';

function contextFilter(model, req, done) {
  if (req.auth && !req.auth.hasAdminPrivileges) {
    return done(model.find({ userId: req.auth.sub }));
  }
  return done(model);      
}

module.exports = contextFilter;