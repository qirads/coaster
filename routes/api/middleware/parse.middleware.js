'use strict';

var _ = require('lodash');
var peg = require('pegjs');
var fs = require('fs');
var grammar = fs.readFileSync('routes/api/middleware/parse.grammar.txt').toString();
var parser = peg.generate(grammar);

function parse(req, res, next) {
  var parsedCriteria = [];
  var textCriteria = [];
  var warnings = [];
  
  _.forEach(req.body.criteria, function(criterion, index) {
    try {
      parsedCriteria.push(parser.parse(criterion));
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
      multi_match: {
        query: textCriteria.join(' '),
        type: 'cross_fields',
        operator: 'and',
        fields: ['description', 'history', 'reports.text']
      }
    });
  }
  
  req.conditions = parsedCriteria;

  if (warnings.length) {
    req.warnings = warnings;
  }

  next();
}

module.exports = parse;