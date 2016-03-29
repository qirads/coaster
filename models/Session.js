'use strict';

module.exports = function(config) {

  var mongoose = require('mongoose');
  var jwt = require('jsonwebtoken');
  var User = mongoose.model('User');

  var SessionSchema = new mongoose.Schema( {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      default: 'active',
      enum: [ 'active', 'user-logged-out', 'user-timed-out', 'server-revoked' ]
    },
    lastRefreshedAt: Date
  });

  SessionSchema.methods.generateJWT = generateJWT;
  
  function generateJWT(callback) {
    var self = this;
    User.findById(this.userId, function (err, user) {
      if (err) { return callback(err); }
      self.save(function(err) {
        if (err) { return callback(err); }
        self.lastRefreshedAt = Date.now();
        return callback(null, jwt.sign({
          isAdmin : user.isAdmin
        }, config.jwts.secretKey, {
          subject : self.userId,
          jwtid: self._id,
          expiresIn: '5 minutes'
        }));
      });
    });
  }
  
  mongoose.model('Session', SessionSchema);

}