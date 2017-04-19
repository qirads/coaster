'use strict';

module.exports = function(config, clients) {

  var mongoose = require('mongoose');
  var jwt = require('jsonwebtoken');
  var blacklist = require('../lib/blacklist.wrapper')(clients.redis);
    
  var SessionSchema = new mongoose.Schema({
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

  SessionSchema.methods.generateJWT = generateJWT;
  SessionSchema.methods.revoke = revoke;

  function generateJWT() {
    this.set('token', jwt.sign({
      hasAdminPrivileges : this.hasAdminPrivileges
    }, config.jwts.secretKey, {
      subject : this.userId.toString(),
      jwtid: this._id.toString(),
      expiresIn: config.jwts.secondsToExpiration
    }), String, { strict: false });
  }
    
  function revoke() {
    blacklist.revoke({ jti: this._id, sub: this.userId }, config.jwts.secondsToExpiration);
  }
  
  mongoose.model('Session', SessionSchema);

}