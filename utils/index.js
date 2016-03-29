'use strict';

var dns = require('dns');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var utils = {
  offline: offline,
  forEachSubdir: forEachSubdir
};

function offline() {
  if (process.platform === 'win32') {
    if (!dns.lookupWithAddrConfigSupport) {
      dns.lookupWithAddrConfigSupport = dns.lookup;
      dns.lookup = lookupWithoutAddrConfigSupport;
    }
  }  
}

function lookupWithoutAddrConfigSupport(hostname, options, callback) {
  if (typeof options !== 'function' && options !== null && options.hints & dns.ADDRCONFIG) {
    options.hints &= ~dns.ADDRCONFIG;
  } 
  return dns.lookupWithAddrConfigSupport(hostname, options, callback);
}

function forEachSubdir(dir, fn) {
  
  // get all file names at path
  var files = fs.readdirSync(dir);

  // filter list to include those that are directories  
  files = files.filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
  _.forEach(files, function(file) {
    fn(path.join(dir, file));
  });
   
}

module.exports = utils;