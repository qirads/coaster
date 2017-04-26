'use strict';

module.exports = function(config) {

  return {
    mongoose: require('mongoose').createConnection(
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
