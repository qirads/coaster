'use strict';

module.exports = function(clients) {

  var mongoose = require('mongoose');
  var mongoosastic = require('mongoosastic');
  var StudySchema = new mongoose.Schema({
    timestamp: Date,
    verified: Boolean,
    institution: String,
    unit: String,
    modality: String,
    description: String,
    history: String,
    bodyPart: String,
    specialty: String,
    reports: [{
      timestamp: Date,
      text: String
    }]
  });
  
  StudySchema.plugin(mongoosastic);
  
  return clients.mongoose.model('Study', StudySchema);
    
}