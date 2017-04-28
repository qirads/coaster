'use strict';

var createError = require('http-errors');
var Joi = require ('joi');

var schema = Joi.object().keys({
  criteria: Joi.array().items(Joi.string()).required(),
  pageSize: Joi.number()
});

function validate(value, next) {
  Joi.validate(value, schema, function(err) {
    if (err) { return next(createError(400, 'Invalid request', err)); }
    next();
  });
}

function validateCreateBody(req, res, next) {
  validate(req.body, next);
}

var validations = {
  validatePreCreate: validateCreateBody
};

module.exports = validations;