'use strict';

module.exports = function(config) {

  var mongoose = require('mongoose');
  var jwt = require('jsonwebtoken');
  var blacklist = require('express-jwt-blacklist');

  blacklist.configure({
    tokenId: 'sub',
    indexBy: 'jti',
    store: { type: 'redis' }
  });
  
  var SessionSchema = new mongoose.Schema( {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hasAdminPrivileges: { type: Boolean, default: false },
    state: {
      type: String,
      default: 'open',
      enum: [ 'open', 'user-logged-out', 'user-timed-out', 'user-revoked', 'admin-revoked' ]
    },
    createdAt: { type: Date, required: true, default: Date.now },
    lastRefreshedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date },    
  });

  SessionSchema.methods.generateJWT = function() {
    this.set('token', jwt.sign({
      hasAdminPrivileges : this.hasAdminPrivileges
    }, config.jwts.secretKey, {
      subject : this.userId,
      jwtid: this._id,
      expiresIn: config.jwts.secondsToExpiration * 1000
    }), String, { strict: false });
  }
  
  SessionSchema.methods.revoke = function() {
    blacklist.revoke({ jti: this._id, sub: this.userId }, config.jwts.secondsToExpiration);
  }
  
  mongoose.model('Session', SessionSchema);

}