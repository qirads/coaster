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
  
  function validateFields(fields, schema, details, prefix) {
    _.forEach(schema, function(fieldSchema) {
      checkFieldSchema(fields[fieldSchema.name], fieldSchema, details, prefix);      
    });
    checkExtraneousFields(fields, schema, details, prefix);
  }

  function checkFieldSchema(field, fieldSchema, details, prefix) {
    if (_.isArray(fieldSchema.type) === _.isArray(field)) {
      if (_.isArray(field)) {
        _.forEach(field, function(individualField, index) {
          var individualFieldSchema = _.merge({}, fieldSchema, { type: fieldSchema.type[0]});
          checkEachField(individualField, individualFieldSchema, details, prefix, index);
        });
      } else {
        checkEachField(field, fieldSchema, details, prefix);
      }
    } else {
      var errors = [(_.isArray(field) ? 'received' : 'expected') + ' array of values instead of simple value'];
      addToDetails(field, fieldSchema, details, prefix, errors);
    }
  }

  function checkEachField(field, fieldSchema, details, prefix, index) {
    if (fieldSchema.type === 'object') {
      if (field) {
        if (typeof field === 'object') {
          validateFields(
            field, fieldSchema.schema, details,
            prefix + fieldSchema.name + (index === undefined ? '.' : '[' + index + '].'));          
        } else {
          addToDetails(field, fieldSchema, details, prefix, ['expected object instead of simple value'], index);          
        }
      } else if (fieldSchema.required) {
        addToDetails(field, fieldSchema, details, prefix, ['missing required field'], index);
      }
    } else {
      validateField(field, fieldSchema, details, prefix, index);
    }
  }
  
  function checkExtraneousFields(body, schema, details, prefix) {
    var allowedFields = _.map(schema, function(fieldSchema) { return fieldSchema.name; });
    var extraneousFields = _.omit(body, allowedFields);
    _.forEach(extraneousFields, function(value, key) {
      addToDetails(field, {}, details, prefix, 'unrecognized field', index);
    });
  }
  
  function validateField(field, fieldSchema, details, prefix, index) {
    var errors = [];
    if (fieldSchema.required && !field) {
      errors.push('missing required field');
    }
    if (field && fieldSchema.type != typeof field) {
      errors.push('unexpected field type');
    }
    if (field && fieldSchema.allowedValues && !_.includes(fieldSchema.allowedValues, field)) {
      errors.push('value not allowed');
    }
    if (_.size(errors)) {
      addToDetails(field, fieldSchema, details, prefix, errors, index);
    }
  }
  
  function addToDetails(field, fieldSchema, details, prefix, errors, index) {
    var detail = {
      fieldName: prefix + fieldSchema.name + (index === undefined ? '' : '[' + index + ']'),
      fieldValue: field,
      fieldType: typeof field,
      expectedFieldType: fieldSchema.type,
    };
    
    if (fieldSchema.required) { _.merge(detail, { required: fieldSchema.required }); }
    if (fieldSchema.allowedValues) { _.merge(detail, { allowedValues: fieldSchema.allowedValues }); }
    if (fieldSchema.schema) { _.merge(detail, { schema: fieldSchema.schema }); }
    
    details.push(_.merge(detail, { errors: errors }));
  }
  
}