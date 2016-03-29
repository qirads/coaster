'use strict';

module.exports = function(app, config) {

  var utils = require('../utils');
  var path = require('path');
  var createError = require('http-errors');

  // setup routes
  utils.forEachSubdir(__dirname, function(dir) {
    var route = path.basename(dir);
    app.use('/' + route, require('./' + route)(config));
  });

  // redirect any unmatched routes to root
  app.get(function(req, res) {
    res.redirect(301, '/');
  });

  // do not redirect unmatched non-GET requests.
  app.use(function(req, res, next) {
    next(createError(405, 'Method not allowed'));
  });

};