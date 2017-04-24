/*global describe:false, it:false, expect:false*/

'use strict';

var moment = require ('moment');
var parse = require ('./parse.middleware');

describe('parse', function() {

  it('is a function', function() {
    expect(typeof parse).toBe('function');
  });

  it('calls its third argument', function() {
    var next = jasmine.createSpy('next');
    parse({ body: { criteria: [] } }, null, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('parses demographics:verified', function() {
    var next = jasmine.createSpy('next');
    var req = { body: { criteria: ['demographics: verified'] } };
    parse(req, null, next);
    expect(req.conditions).toEqual([{ term: { verified: true } }]);
    expect(next).toHaveBeenCalledWith();
  });

  it('parses demographics:unverified', function() {
    var next = jasmine.createSpy('next');
    var req = { body: { criteria: ['demographics: unverified'] } };
    parse(req, null, next);
    expect(req.conditions).toEqual([{ term: { verified: false } }]);
    expect(next).toHaveBeenCalledWith();
  });
  
  it('can handle text queries', function() {
    var next = jasmine.createSpy('next');
    var req = { body: { criteria: ['TESTQUERY'] } };
    parse(req, null, next);
    expect(req.conditions).toEqual([{
      multi_match: {
        query: 'TESTQUERY',
        type: 'cross_fields',
        operator: 'and',
        fields: [ 'description', 'history', 'reports.text' ]
      }
    }]);
    expect(next).toHaveBeenCalledWith();
  });

  it('can handle multiple criteria (without regards to whether they are mutually exclusive!)', function() {
    var next = jasmine.createSpy('next');
    var req = { body: { criteria: ['demographics:verified', 'TEST', 'demographics:unverified', 'QUERY'] } };
    parse(req, null, next);
    expect(req.conditions).toEqual([{
      term: { verified: true }
    }, {
      term: { verified: false }
    }, {
      multi_match: {
        query: 'TEST QUERY',
        type: 'cross_fields',
        operator: 'and',
        fields: [ 'description', 'history', 'reports.text' ]
      }
    }]);
    expect(next).toHaveBeenCalledWith();
  });

  it('parses on:today', function() {
    var next = jasmine.createSpy('next');
    var req = { body: { criteria: ['on:today'] } };
    parse(req, null, next);
    var date = moment().format('YYYYMMDD');
    expect(req.conditions).toEqual([{
      range: {
        timestamp: {
          gte: moment(date, 'YYYYMMDD', true).toDate(),
          lt: moment(date, 'YYYYMMDD', true).add(1, 'days').toDate()        
        }        
      }
    }]);
    expect(next).toHaveBeenCalledWith();
  });

  it('parses on:yesterday', function() {
    var next = jasmine.createSpy('next');
    var req = { body: { criteria: ['on:yesterday'] } };
    parse(req, null, next);
    var date = moment().subtract(1, 'days').format('YYYYMMDD');
    expect(req.conditions).toEqual([{
      range: {
        timestamp: {
          gte: moment(date, 'YYYYMMDD', true).toDate(),
          lt: moment(date, 'YYYYMMDD', true).add(1, 'days').toDate()        
        }              
      }
    }]);
    expect(next).toHaveBeenCalledWith();
  });

  it('parses on:20160506', function() {
    var next = jasmine.createSpy('next');
    var req = { body: { criteria: ['on:20160506'] } };
    parse(req, null, next);
    var date = '20160506';
    expect(req.conditions).toEqual([{
      range: {
        timestamp: {
          gte: moment(date, 'YYYYMMDD', true).toDate(),
          lt: moment(date, 'YYYYMMDD', true).add(1, 'days').toDate()        
        }        
      }
    }]);
    expect(next).toHaveBeenCalledWith();
  });

  it('parses on:20160506 as text because it is invalid date', function() {
    var next = jasmine.createSpy('next');
    var req = { body: { criteria: ['on:20161306'] } };
    parse(req, null, next);
    expect(req.conditions).toEqual([{
      multi_match: {
        query: 'on:20161306',
        type: 'cross_fields',
        operator: 'and',
        fields: [ 'description', 'history', 'reports.text' ]
      }   
    }]);
    expect(next).toHaveBeenCalledWith();
  });

});