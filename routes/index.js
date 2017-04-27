'use strict';

module.exports = function(app, clients) {

  var restifyWrapper = require('./restify.wrapper')(app);
  var createError = require('http-errors');
  var _ = require('lodash');

  // setup api routes
  _.forEach(['user', 'session', 'study', 'search'], function(endpoint) {
    restifyWrapper.serve(
      require('./' + endpoint + '/' + endpoint + '.model')(clients),
      require('./' + endpoint + '/' + endpoint + '.config')(clients));
  });
  
  // return 404 for any unmatched API routes
  app.use('/api', function(req, res, next) {
    next(createError(404));
  });

  // redirect any unmatched routes to root
  app.use(function(req, res) {
    res.redirect(301, '/');
  });

};