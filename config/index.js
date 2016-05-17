'use strict';

var fs = require('fs');
var credentials = require('./credentials');

module.exports = {
  hostName: 'www.glass.org',
  ldapPath: 'ldap://www.glass.org:10389',
  dbPath: 'mongodb://www.glass.org/coaster',
  filePaths: {
    rootCertificate: 'config/certs/dev-root-cert.pem'
  },
  credentials: {
    admin: {
      userName: credentials.admin.userName,
      password: credentials.admin.password
    },
    mongoDB: {
      userName: credentials.mongoDB.userName,
      password: credentials.mongoDB.password
    },
    redis: {
      password: credentials.redis.password
    }
  },
  certs: {
    privateKey: fs.readFileSync('config/certs/dev-key.pem'),
    certificate: fs.readFileSync('config/certs/dev-cert.pem'),
    rootCertificate: fs.readFileSync('config/certs/dev-root-cert.pem')
  },
  jwts: {
    secretKey: fs.readFileSync('config/jwts/jwtSecretKey.txt'),
    secondsToExpiration: 300  
  },
  resultLimit: 100
};