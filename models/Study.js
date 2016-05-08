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
    bodyPart: String,
    specialty: String,
    reports: [{
      timestamp: Date,
      text: String
    }]
  });

  mongoose.model('Study', StudySchema);
  
}