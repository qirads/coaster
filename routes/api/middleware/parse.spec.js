/*global describe:false, it:false, expect:false*/

'use strict';

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

  it('calls its third argument with no error if parses', function() {
    var next = jasmine.createSpy('next');
    parse({ body: { criteria: [ 'demographics: verified'] } }, null, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls its third argument with an error if does not parse', function() {
    var next = jasmine.createSpy('next');
    parse({ body: { criteria: [ 'demoraphics: verified'] } }, null, next);
    expect(next).toHaveBeenCalled();
    expect(next.calls.length).toEqual(1);
    expect(next).not.toHaveBeenCalledWith();
  });

});