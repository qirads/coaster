'use strict';

module.exports = function(config, clients) {

  var mongoose = require('mongoose');
  var SearchSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, required: true },
    criteria: { type: [String] }
  });
  
  mongoose.model('Search', SearchSchema);
  
}