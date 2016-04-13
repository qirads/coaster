'use strict';

module.exports = function(config) {

  var mongoose = require('mongoose');
  var jwt = require('jsonwebtoken');
  var blacklist = require('express-jwt-blacklist');
  var User = mongoose.model('User');

  blacklist.configure({
    tokenId: 'sub',
    indexBy: 'jti',
    store: { type: 'redis' }
  });
  
  var SessionSchema = new mongoose.Schema( {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    state: {
      type: String,
      default: 'active',
      enum: [ 'active', 'user-logged-out', 'user-timed-out', 'admin-logged-out' ]
    },
    createdAt: { type: Date, required: true, default: Date.now },
    lastRefreshedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date },    
  });

  SessionSchema.methods.generateJWT = function(callback) {
    var self = this;
    User.findById(this.userId, function (err, user) {
      if (err) { return callback(err); }
      return callback(null, jwt.sign({
        isAdmin : user.isAdmin
      }, config.jwts.secretKey, {
        subject : user._id,
        jwtid: self._id,
        expiresIn: config.jwts.secondsToExpiration * 1000
      }));
    });
  }
  
  SessionSchema.methods.revoke = function() {
    blacklist.revoke({ jti: this._id, sub: this.userId }, config.jwts.secondsToExpiration);
  }
  
  mongoose.model('Session', SessionSchema);

}