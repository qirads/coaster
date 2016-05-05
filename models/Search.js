'use strict';

module.exports = function(config, clients) {

  var mongoose = require('mongoose');
  var SearchSchema = new mongoose.Schema( {
    criteria: { type: [String], lowercase: true, required: true },
  });

  mongoose.model('Search', SearchSchema);
  
}