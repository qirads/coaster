'use strict';

var createError = require('http-errors');
var _ = require('lodash');

module.exports = function(schema) {
  
  return function(req, res, next) {
    var details = [];
    
    validateFields(req.body, schema, details, '');
    if (_.size(details)) {
      return next(createError(400, 'Invalid request', { details: details }));
    }
    next();
  };
    
  function validateFields(body, schema, details, prefix) {
    _.forEach(schema, function(fieldSchema) {
      if (fieldSchema.type === 'object') {
        if (body[fieldSchema.name]) {
          validateFields(body[fieldSchema.name], fieldSchema.schema, details, prefix + fieldSchema.name + '.');
        } else if (fieldSchema.required) {
          details.push({
            fieldName: prefix + fieldSchema.name,
            required: fieldSchema.required,
            expectedFieldType: fieldSchema.type,
            schema: fieldSchema.schema,
            errors: ['missing required field']
          });            
        }
      } else {
        validateField(body, fieldSchema, details, '');
      }
    });
    checkExtraneousFields(body, schema, details, '');
  }
  
  function checkExtraneousFields(body, schema, details, prefix) {
    var allowedFields = _.map(schema, function(fieldSchema) { return fieldSchema.name; });
    var extraneousFields = _.omit(body, allowedFields);
    _.forEach(extraneousFields, function(value, key) {
      details.push({
        fieldName: prefix + key,
        fieldValue: value,
        fieldType: typeof value,
        error: 'unrecognized field'
      });
    });
  }
    
  function validateField(body, fieldSchema, details, prefix) {
    var fieldErrors = [];
    if (fieldSchema.required && !body[fieldSchema.name]) {
      fieldErrors.push('missing required field');
    }
    if (body[fieldSchema.name] && fieldSchema.type != typeof body[fieldSchema.name]) {
      fieldErrors.push('unexpected field type');
    }
    if (body[fieldSchema.name] && fieldSchema.allowedValues && !_.includes(fieldSchema.allowedValues, body[fieldSchema.name])) {
      fieldErrors.push('value not allowed');
    }
    if (_.size(fieldErrors)) {
      details.push({
        fieldName: prefix + fieldSchema.name,
        fieldValue: body[fieldSchema.name],
        fieldType: typeof body[fieldSchema.name],
        required: fieldSchema.required,
        expectedFieldType: fieldSchema.type,
        allowedValues: fieldSchema.allowedValues,
        errors: fieldErrors
      });
    }
  }
      
}