'use strict';

module.exports = function(clients) {

  var passport = require('passport');
  var LdapStrategy = require('passport-ldapauth');
  var LocalStrategy = require('passport-local');
  var User = clients.mongoose.model('User');
  var createError = require('http-errors');
  var _ = require('lodash');

  var LDAP_OPTS = {
    server: {
      url: process.env.COASTER_PATHS_LDAP,
      searchBase: 'dc=CORP,dc=example,dc=com',
      searchFilter: '(uid={{username}})'
    }
  };

  var LOCAL_OPTS = {
    usernameField: 'credentials[userName]',
    passwordField: 'credentials[password]'
  };

  LDAP_OPTS = _.merge(LDAP_OPTS, LOCAL_OPTS);

  var strategies = [];
  if (process.env.COASTER_PATHS_LDAP != '') {
    passport.use(new LdapStrategy(LDAP_OPTS, ldapVerify));
    strategies.push('ldapauth');    
  }
  passport.use(new LocalStrategy(LOCAL_OPTS, localVerify));
  strategies.push('local');

  return {
    initialize: initialize,
    authenticate: authenticate    
  };

  function ldapVerify(user, done) {
    User.findOne({ userName: { $eq: user.uid } }, function (err, user) {
      if (err) { return done(err); }
      if (!user || !user.activated ) {
        return done(null, false, { message: 'User not activated' });
      }
      return done(null, user);
    });
  }

  function localVerify(userName, password, done) {
    User.findOne({ userName: { $eq: userName.toLowerCase() } }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      if (!user.matchesHash(password)) {
        return done(null, false, { message: 'Invalid username/password' });
      }
      if (!user.activated ) {
        return done(null, false, { message: 'User not activated' });
      }
      return done(null, user);
    });    
  }

  function initialize() {
    return passport.initialize();
  }

  function authenticate() {
    return function(req, res, next) {
      passport.authenticate(strategies, { session: false }, function(err, user, info ) {
        if (err) { return next(err); }
        if (!user) {
          return next(createError(401, info[0].message, {
            details: {
              strategies: [{
                name: 'ldapauth',
                response: info[0].message
              },
              {
                name: 'local',
                response: info[1].message
              }]
            }
          }));
        }
        req.body.userId = user._id;
        req.body.hasAdminPrivileges = user.isAdmin;
        next();
      })(req, res, next);
    }
  }

};