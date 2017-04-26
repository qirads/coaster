'use strict';

module.exports = function(config, clients) {

  var mongoose = require('mongoose');
  var mongoosastic = require('mongoosastic');
  var StudySchema = new mongoose.Schema({
    timestamp: Date,
    verified: Boolean,
    institution: { type: String, es_index: 'not_analyzed' },
    unit: { type: String, es_index: 'not_analyzed' },
    modality: { type: String, es_index: 'not_analyzed' },
    description: { type: String, es_index: 'not_analyzed' },
    history: String,
    bodyPart: { type: String, es_index: 'not_analyzed' },
    specialty: { type: String, es_index: 'not_analyzed' },
    reports: [{
      timestamp: Date,
      text: String
    }]
  });
  
  StudySchema.plugin(mongoosastic, {
    auth: config.credentials.es.userName + ':' + config.credentials.es.password
  });
  
  return clients.mongoose.model('Study', StudySchema);
    
}