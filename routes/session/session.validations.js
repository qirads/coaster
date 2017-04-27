var options = require('../common/options'); 
var allowedSessionStates = options.allowedSessionStates;

var create = [{
  name: 'credentials',
  type: 'object',
  required: true,
  schema: [
    {
      name: 'userName',
      type: 'string',
      required: true
    },
    {
      name: 'password',
      type: 'string',
      required: true
    }
  ]
}];

var update = [{
  name: 'state',
  type: 'string',
  required: true,
  allowedValues: allowedSessionStates
}];

var validations = {
  create: create,
  update: validate
};

module.exports = validations;