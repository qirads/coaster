var options = require('../common/options'); 
var allowedDomains = options.allowedDomains;

var create = [{
    name: 'userName',
    type: 'string',
    required: true
  }, {
    name: 'password',
    type: 'string'
  }, {
    name: 'domain',
    type: 'string',
    allowedValues: allowedDomains
  }, {
    name: 'isAdmin',
    type: 'boolean'
  }, {
    name: 'activated',
    type: 'boolean'
  }];

var update = [{
    name: 'password',
    type: 'string'
  },{
    name: 'activated',
    type: 'boolean'
  }]

  module.exports = {
    create,
    update
  }