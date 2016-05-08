'use strict';

module.exports = function(config, clients) {

  var _ = require('lodash');

  _.forEach(['Study', 'User', 'Session', 'Search'], function(value) {
    require('./' + value)(config, clients);
  });

};