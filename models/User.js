'use strict';

module.exports = function(config) {

  var mongoose = require('mongoose');
  var crypto = require('crypto');
  var jwt = require('jsonwebtoken');
  var blacklist = require('express-jwt-blacklist');

  blacklist.configure({
    tokenId: 'sub',
    indexBy: 'jti',
    store: { type: 'redis' }
  });

  var UserSchema = new mongoose.Schema( {
    userName: { type: String, lowercase: true, unique: true, required: true },
    domain: { type: String, enum: [ 'CORP', 'local' ], default: 'local' },
    isAdmin: { type: Boolean, default: false },
    activated: { type: Boolean, default: false },
    hash: { type: String },
    salt: { type: String }
  });

  UserSchema.virtual('password').set(setPassword);
  UserSchema.methods.matchesHash = matchesHash;

  ['toJSON', 'toObject'].forEach(function (prop) {
    UserSchema.set(prop, {
      transform: function (doc, ret) {
        delete ret.hash;
        delete ret.salt;
      }
    });
  });
  
  UserSchema.methods.generateJWT = function(sessionId) {
    this.set('token', jwt.sign({
      hasAdminPrivileges : this.isAdmin
    }, config.jwts.secretKey, {
      subject : this._id,
      jwtid: sessionId,
      expiresIn: config.jwts.secondsToExpiration * 1000
    }), String, { strict: false });
  }
  
  UserSchema.methods.purge = function() {
    blacklist.purge({ sub: this._id }, config.jwts.secondsToExpiration);
  }  

  mongoose.model('User', UserSchema);

  function setPassword(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  }

  function matchesHash(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
  }
  
}