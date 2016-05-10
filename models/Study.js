'use strict';

module.exports = function(config, clients) {

  var mongoose = require('mongoose');
  var StudySchema = new mongoose.Schema({
    timestamp: Date,
    verified: Boolean,
    institution: String,
    location: String,
    modality: String,
    description: String,
    history: { type: String, text:true },
    bodyPart: String,
    specialty: String,
    reports: [{
      timestamp: Date,
      text: { type: String, text:true }
    }]
  });
  
  mongoose.model('Study', StudySchema);
  
}