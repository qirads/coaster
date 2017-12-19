'use strict';

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var clients = {
  mongoose: mongoose.createConnection(process.env.COASTER_PATHS_MONGODB),
  redis: require('redis').createClient()
};

module.exports = clients;