'use strict';

module.exports = function(app, config, clients) {

  var restifyWrapper = require('./restify.wrapper')(app);
  var _ = require('lodash');

  // setup api routes
  _.forEach(['user', 'session', 'study', 'search'], function(endpoint) {
    restifyWrapper.serve(
      require('./' + endpoint + '.model')(config, clients),
      require('./' + endpoint + '.config')(app, config, clients));
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