'use strict';

module.exports = function(config) {

  var mongoose = require('mongoose');
  mongoose.Promise = global.Promise;

  return {
    mongoose: mongoose.createConnection(
      config.dbPath, {
        user: config.credentials.mongoDB.userName,
        pass: config.credentials.mongoDB.password,
        server: {
          ssl: true,
          sslCA: config.certs.rootCertificate
        }
      }
    ),
    redis: require('redis').createClient({
      password: config.credentials.redis.password
    })
  };

};
