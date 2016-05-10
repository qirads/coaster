'use strict';

var createError = require('http-errors');
var _ = require('lodash');
var PEG = require('pegjs');
var fs = require('fs');
var grammar = fs.readFileSync('routes/api/middleware/parse.grammar.txt').toString();
var parser = PEG.buildParser(grammar);

function parse(req, res, next) {
  var parsedCriteria = [];
  var textCriteria = [];
  var warnings = [];

  _.forEach(req.body.criteria, function(criterion, index) {
    var parsedCriterion;
    try {
      parsedCriteria.push(parser.parse(criterion.toLowerCase()));
    } catch (e) {

      if (e.name === 'SyntaxError') {

        textCriteria.push(criterion);

        if (criterion.indexOf(':') > -1) {
          warnings.push({
            criterion: criterion,
            index: index,
            interpretedAs: 'text',
            errors: e
          });          
        }

      } 

    }
  });
    
  if (textCriteria.length) {
    parsedCriteria.push({
      $text: {
        $search: textCriteria.join(' ')
      }
    })
  }
  
  req.conditions = parsedCriteria.length < 2 ? parsedCriteria[0] : { $and: parsedCriteria };
  
  if (warnings.length) {
    req.warnings = warnings;
  }
    
  next();
}

module.exports = parse;