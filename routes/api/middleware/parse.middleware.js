'use strict';

var createError = require('http-errors');
var _ = require('lodash');
var PEG = require('pegjs');
var fs = require('fs');
var grammar = fs.readFileSync('routes/api/middleware/parse.grammar.txt').toString();
var parser = PEG.buildParser(grammar);

function parse(req, res, next) {
  var parsedCriteria = [];
  var details = [];
  _.forEach(req.body.criteria, function(criterion, index) {
    var parsedCriterion;
    try {
      parsedCriterion = parser.parse(criterion);
    } catch (e) {
      if (e.name === 'SyntaxError') {
        details.push({
          criterion: criterion,
          indexWithinProvidedCriteria: index,
          errors: e
        });
      } 
    } 
    parsedCriteria.push(parsedCriterion);
  });
  
  if (_.size(details)) {
    return next(createError(400, 'Invalid search criteria.', { details: details }));
  }
  
  req.parsedCriteria = parsedCriteria;
  next();
}

module.exports = parse;