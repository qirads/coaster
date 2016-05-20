'use strict';

module.exports = function(config, clients) {

  var mongoose = require('mongoose');
  var mongoosastic = require('mongoosastic');
  var StudySchema = new mongoose.Schema({
    timestamp: Date,
    verified: Boolean,
    institution: { type: String, index: true },
    unit: { type: String, index: true },
    modality: { type: String, index: true },
    description: { type: String, index: true },
    history: String,
    bodyPart: { type: String, index: true },
    specialty: { type: String, index: true },
    reports: [{
      timestamp: Date,
      text: String
    }]
  });
  
  StudySchema.plugin(mongoosastic);
  
  mongoose.model('Study', StudySchema);
    
}