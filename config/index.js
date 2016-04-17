'use strict';

var fs = require('fs');

module.exports = {
  hostName: 'www.glass.org',
  ldapPath: 'ldap://www.glass.org:10389',
  dbPath: 'mongodb://www.glass.org/coaster',
  filePaths: {
    rootCertificate: 'config/certs/dev-root-cert.pem'
  },
  credentials: require('./credentials'),
  certs: {
    privateKey: fs.readFileSync('config/certs/dev-key.pem'),
    certificate: fs.readFileSync('config/certs/dev-cert.pem')    
  },
  jwts: {
    secretKey: fs.readFileSync('config/jwts/jwtSecretKey.txt'),
    secondsToExpiration: 300  
  }
};