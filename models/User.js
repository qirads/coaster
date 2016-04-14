'use strict';

module.exports = function() {

  var mongoose = require('mongoose');
  var crypto = require('crypto');

  var UserSchema = new mongoose.Schema( {
    userName: { type: String, lowercase: true, unique: true, required: true },
    domain: { type: String, enum: [ 'CORP', 'local' ], default: 'local' },
    isAdmin: { type: Boolean, default: false },
    hash: { type: String, required: true },
    salt: { type: String, required: true }
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