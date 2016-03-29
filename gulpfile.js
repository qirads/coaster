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

gulp.task('test', ['lint'], function () {
	return gulp.src(['**/*.spec.js','!node_modules/**'])
		.pipe($.jasmineNode());
});

gulp.task('default', [ 'develop' ]);