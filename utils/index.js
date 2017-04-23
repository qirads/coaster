'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var utils = {
  forEachSubdir: forEachSubdir
};

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