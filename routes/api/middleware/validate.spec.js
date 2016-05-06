/*global describe:false, it:false, expect:false*/

'use strict';

var validate = require ('./validate.middleware');

describe('validate', function() {

  it('is a function', function() {
    expect(typeof validate).toBe('function');
  });

  it('returns a function', function() {
    expect(typeof validate()).toBe('function');
  });

  it('returns a function that calls its third argument', function() {
    var next = jasmine.createSpy('next');
    validate()({ body: {} }, null, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('creates middleware that can mark fields as required', function() {
    var next = jasmine.createSpy('next');
    var testSchema = [{
      name: 'testField',
      type: 'string',
      required: true
    }];
    validate(testSchema)({ body: {} }, null, next);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith();
  });

  it('creates middleware that can mark fields as string', function() {
    var next = jasmine.createSpy('next');
    var testSchema = [{
      name: 'testField',
      type: 'string',
      required: true
    }];
    validate(testSchema)({ body: { testField: 5 } }, null, next);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith();
    validate(testSchema)({ body: { testField: 'test' } }, null, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('creates middleware that can mark fields as number', function() {
    var next = jasmine.createSpy('next');
    var testSchema = [{
      name: 'testField',
      type: 'number',
      required: true
    }];
    validate(testSchema)({ body: { testField: 'test' } }, null, next);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith();
    validate(testSchema)({ body: { testField: 5 } }, null, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('creates middleware that can mark fields as object', function() {
    var next = jasmine.createSpy('next');
    var testSchema = [{
      name: 'testField',
      type: 'object',
      required: true
    }];
    validate(testSchema)({ body: { testField: 'test' } }, null, next);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith();
    validate(testSchema)({ body: { testField: {} } }, null, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('creates middleware that can mark fields as array', function() {
    var next = jasmine.createSpy('next');
    var testSchema = [{
      name: 'testField',
      type: ['string'],
      required: true
    }];
    validate(testSchema)({ body: { testField: 'test' } }, null, next);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith();
    validate(testSchema)({ body: { testField: [] } }, null, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('creates middleware that can check types of array members', function() {
    var next = jasmine.createSpy('next');
    var testSchema = [{
      name: 'testField',
      type: ['string'],
      required: true
    }];
    validate(testSchema)({ body: { testField: [5] } }, null, next);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith();
    validate(testSchema)({ body: { testField: ['test'] } }, null, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('creates middleware that can use nested schemas', function() {
    var next = jasmine.createSpy('next');
    var testSchema = [{
      name: 'testField',
      type: ['object'],
      schema: [{
        name: 'subField',
        type: 'object',
        required: true,
        schema: [{
          name: 'subSubField',
          type: 'string',
          required: true
        }]
      }]
    }];
    validate(testSchema)({ body: { testField: [{ subField: { subSubField: 5 } }] } }, null, next);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith();
    validate(testSchema)({ body: { testField: [{ subField: { subSubField: 'test' } }] } }, null, next);
    expect(next).toHaveBeenCalledWith();
  });

});