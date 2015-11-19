'use strict';

var gulp         = require('gulp');
var sass         = require('gulp-sass');
var gutil        = require('gulp-util');
var w3cjs        = require('gulp-w3cjs');
var jshint       = require('gulp-jshint');
var gulpif       = require('gulp-if');
var uglify       = require('gulp-uglify');
var concat       = require('gulp-concat');
var stylish      = require('jshint-stylish');
var minifyHTML   = require('gulp-minify-html');
var fileinclude  = require('gulp-file-include');
var autoprefixer = require('gulp-autoprefixer');
var browserSync  = require('browser-sync').create();

var env_dev, jsSources, sassSources, htmlSources, outputDir, sassStyle;

env_dev     = true;
htmlSources = ['app/*.html'];
sassSources = ['app/scss/**/*.scss'];
jsSources   = ['app/js/*.js'];

if ( env_dev ) {
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
} else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
}

gulp.task('html', function() {
  return gulp.src(htmlSources)
    .pipe(fileinclude({ basepath: 'app/partials/'}))
    .pipe(gulpif( !env_dev, minifyHTML({empty: true})))
    .pipe(gulp.dest(outputDir));
});

gulp.task('sass', function() {
  return gulp.src( sassSources )
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest( outputDir + 'css' ));
})

gulp.task('js', function() {
  return gulp.src( jsSources )
    .pipe(jshint('./.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(concat('script.js'))
    .on('error', gutil.log)
    .pipe(gulpif( !env_dev, uglify()))
    .pipe(gulp.dest(outputDir + 'js'))
});

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: outputDir
    },
    port: 8080
  });
});
