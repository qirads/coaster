'use strict';

var createError = require('http-errors');
var options = require('../common/options');
var Joi = require ('joi');
var _ = require('lodash');

var newUserSchema = Joi.object().keys({
  userName: Joi.string().min(3).max(30).required(),
  domain: Joi.only(options.allowedDomains).default('local'),
  password: Joi.when('domain', {
    is: 'local',
    then: Joi.string().min(3).max(30).required(),
    otherwise: Joi.forbidden()
  }),
  isAdmin: Joi.bool().default(false),
  activated: Joi.bool().default(false),
});

var updatedUserSchema = Joi.object().keys({
  _id: Joi.object().required(),
  __v: Joi.number().required(),
  userName: Joi.string().min(3).max(30).required(),
  domain: Joi.only(options.allowedDomains).default('local'),
  password: Joi.when('domain', {
    is: 'local',
    then: Joi.string().min(3).max(30).required(),
    otherwise: Joi.forbidden()
  }),
  isAdmin: Joi.bool().default(false),
  activated: Joi.bool().default(false),
});

function validate(value, schema, next) {
  Joi.validate(value, schema, function(err) {
    if (err) { return next(createError(400, 'Invalid request', err)); }
    next();
  });
}

function validateBodyOnCreate(req, res, next) {
  validate(req.body, newUserSchema, next);
}

function validateDocWithNewBodyOnUpdate(req, res, next) {
  var updatedDocWithBody = _.assign({}, req.erm.document.toObject(), req.body);
  validate(updatedDocWithBody, updatedUserSchema, next);
}

var validations = {
  validatePreCreate: validateBodyOnCreate,
  validatePreUpdate: validateDocWithNewBodyOnUpdate
};

module.exports = validations;