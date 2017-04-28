'use strict';

var createError = require('http-errors');
var options = require('../common/options');
var Joi = require ('joi');

var credentialsSchema = Joi.object().keys({
  credentials: Joi.object().keys({
    userName: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(3).max(30).required()
  }).required()
});

var sessionSchema = Joi.object().keys({
  id: Joi.string(),
  state: Joi.only(options.allowedSessionStates).required()
});

function validate(value, schema, next) {
  Joi.validate(value, schema, function(err) {
    if (err) { return next(createError(400, 'Invalid request', err)); }
    next();
  });
}

function validateCreateBody(req, res, next) {
  validate(req.body, credentialsSchema, next);
}

function validateUpdateBody(req, res, next) {
  validate(req.body, sessionSchema, next);
}

var validations = {
  validatePreCreate: validateCreateBody,
  validatePreUpdate: validateUpdateBody
};

module.exports = validations;