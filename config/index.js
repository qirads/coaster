'use strict';

var fs = require('fs');

module.exports = {
  ldapPath: 'ldap://www.glass.org:10389',
  dbPath: 'mongodb://www.glass.org/coaster',
  filePaths: {
    rootCertificate: 'config/certs/dev-root-cert.pem'
  },
  certs: {
    privateKey: fs.readFileSync('config/certs/dev-key.pem'),
    certificate: fs.readFileSync('config/certs/dev-cert.pem')    
  },
  jwts: {
    secretKey: fs.readFileSync('config/jwts/jwtSecretKey.txt')  
  }
};