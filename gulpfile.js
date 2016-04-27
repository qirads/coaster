'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('lint', function () {
  
  return gulp.src(['**/*.js','!node_modules/**'])
    .pipe($.eslint())
    .pipe($.eslint.format());
})

gulp.task('develop', ['lint'], function () {
  $.nodemon({
    verbose: true,
    script: 'bin/www',
    tasks: ['lint']
  });
});

gulp.task('test', function () {
	return gulp.src(['**/*.spec.js','!node_modules/**'])
		.pipe($.jasmine({ verbose: true, captureExceptions: true }))
    .pipe($.exit());
});

gulp.task('default', [ 'develop' ]);