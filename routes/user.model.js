'use strict';

module.exports = function(config, clients) {

  var mongoose = require('mongoose');
  var crypto = require('crypto');
  var jwt = require('jsonwebtoken');
  var blacklist = require('./blacklist.wrapper')(clients.redis);
  
  var UserSchema = new mongoose.Schema({
    userName: { type: String, lowercase: true, unique: true, required: true },
    domain: { type: String, enum: [ 'CORP', 'local' ], default: 'local' },
    isAdmin: { type: Boolean, default: false },
    activated: { type: Boolean, default: false },
    hash: { type: String },
    salt: { type: String }
  });

  UserSchema.virtual('password').set(setPassword);
  UserSchema.methods.matchesHash = matchesHash;
  UserSchema.methods.generateJWT = generateJWT;
  UserSchema.methods.purge = purge;

  ['toJSON', 'toObject'].forEach(function (prop) {
    UserSchema.set(prop, {
      transform: function (doc, ret) {
        delete ret.hash;
        delete ret.salt;
      }
    });
  });

  return clients.mongoose.model('User', UserSchema);

  function setPassword(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  }

  function matchesHash(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
  }
  
  function generateJWT(sessionId) {
    this.set('token', jwt.sign({
      hasAdminPrivileges : this.isAdmin
    }, config.jwts.secretKey, {
      subject : this._id.toString(),
      jwtid: sessionId.toString(),
      expiresIn: config.jwts.secondsToExpiration
    }), String, { strict: false });
  }
  
  function purge() {
    blacklist.purge({ sub: this._id }, config.jwts.secondsToExpiration);
  }  

}