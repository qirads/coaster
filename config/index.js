'use strict';

var fs = require('fs');
var path = require('path');
var credentials = require('./credentials');

module.exports = {
  hostName: 'www.glass.org',
  ldapPath: 'ldap://www.glass.org:10389',
  dbPath: 'mongodb://www.glass.org/coaster',
  filePaths: {
    rootCertificate: path.join(__dirname, 'certs', 'dev-root-cert.pem')
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
    es: {
      userName: credentials.es.userName,
      password: credentials.es.password
    },
    redis: {
      password: credentials.redis.password
    }
  },
  certs: {
    privateKey: fs.readFileSync(path.join(__dirname, 'certs', 'dev-key.pem')),
    certificate: fs.readFileSync(path.join(__dirname, 'certs', 'dev-cert.pem')),
    rootCertificate: fs.readFileSync(path.join(__dirname, 'certs', 'dev-root-cert.pem'))
  },
  jwts: {
    secretKey: fs.readFileSync(path.join(__dirname, 'jwts', 'jwtSecretKey.txt')),
    secondsToExpiration: 300  
  },
  resultLimit: 100
};