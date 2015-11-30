'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var paths = {
    scripts: ['server/**/*.js','config/*.js','server.js'],
    tests: 'dist/**/*Spec.js',
    dest: 'dist'
}

gulp.task('build:es6', function () {
    return gulp.src(paths.scripts)
                .pipe(plugins.babel())
                .pipe(gulp.dest(paths.dest));
});

gulp.task('tests:run', ['build'], function () {
    return gulp.src(paths.tests)
                .pipe(plugins.mocha());
});

gulp.task('build', [
    'build:es6'
]);

gulp.task('listen', function() {
    gulp.start('default');
    gulp.watch(paths.scripts, ['default']);
});

gulp.task('default', ['build', 'tests:run']);
