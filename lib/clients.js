'use strict';

var mongoose = require('mongoose');
var fs = require('fs');
mongoose.Promise = global.Promise;

var clients = {
  mongoose: mongoose.createConnection(
    process.env.COASTER_PATHS_MONGODB, {
      user: process.env.COASTER_CREDENTIALS_MONGODB_USERNAME,
      pass: process.env.COASTER_CREDENTIALS_MONGODB_PASSWORD,
      server: {
        ssl: true,
        sslCA: fs.readFileSync(process.env.COASTER_PATHS_ROOTCERTIFICATE)
      }
    }
  ),
  redis: require('redis').createClient({
    password: process.env.COASTER_CREDENTIALS_REDIS_PASSWORD
  })
};

module.exports = clients;