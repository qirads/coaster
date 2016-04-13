'use strict';

module.exports = function(app, config) {

  var utils = require('../utils');
  var path = require('path');
  var createError = require('http-errors');

  // setup routes
  utils.forEachSubdir(__dirname, function(dir) {
    var route = path.basename(dir);
    app.use('/' + route, require('./' + route)(app, config));
  });

  // redirect any unmatched routes to root
  app.use(function(req, res) {
    res.redirect(301, '/');
  });

};