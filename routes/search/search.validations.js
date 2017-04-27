var options = require('../common/options'); 

var create = [{
  name: 'criteria',
  type: ['string'],
  required: true
}, {
  name: 'pageSize',
  type: 'number'
}];

var validations = {
  create: create
};

module.exports = validations;