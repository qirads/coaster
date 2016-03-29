'use strict';

module.exports = function(config) {

  var _ = require('lodash');

  _.forEach(['User', 'Session'], function(value) {
    require('./' + value)(config);
  });

};