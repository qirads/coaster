'use strict';

module.exports = function(config, clients) {

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
  
  mongoose.model('Study', StudySchema);
    
}