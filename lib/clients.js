'use strict';

var mongoose = require('mongoose');
var fs = require('fs');
mongoose.Promise = global.Promise;

var clients = {
  mongoose: mongoose.createConnection(process.env.COASTER_PATHS_MONGODB),
  redis: require('redis').createClient()
};

module.exports = clients;