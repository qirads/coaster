var options = require('../common/options'); 

var create = [{
  name: 'criteria',
  type: ['string'],
  required: true
}, {
  name: 'pageSize',
  type: 'number'
}];

module.exports = {
  create
}