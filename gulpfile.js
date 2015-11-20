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
var plumber      = require('gulp-plumber');
var notify       = require('gulp-notify');
var minifyHTML   = require('gulp-minify-html');
var minifyCSS    = require('gulp-minify-css');
var fileinclude  = require('gulp-file-include');
var autoprefixer = require('gulp-autoprefixer');
var browserSync  = require('browser-sync').create();

var devMode, jsSources, sassSources, htmlSources, outputDir, sassStyle;

htmlSources = ['app/*.html'];
sassSources = ['app/scss/**/*.scss'];
jsSources   = ['app/js/*.js'];

devMode     = true;
outputDir   = devMode ? 'builds/development/' : 'builds/production/';

gulp.task('htmlinclude', function() {
  return gulp.src(htmlSources)
    .pipe(customPlumber('Error Running html-include'))
    .pipe(fileinclude({ basepath: 'app/partials/'}))
    .pipe(gulpif( !devMode, minifyHTML({empty: true})))
    .pipe(gulp.dest(outputDir));
});

gulp.task('w3validate', ['htmlinclude'], function() {
  return gulp.src(outputDir + '**/*.html')
    .pipe(customPlumber('Error Running W3-Validate'))
    .pipe(w3cjs())
    .pipe(notify(function (file) {
      if (!file.w3cjs.success) {
        return "Validation error on " + file.relative + " (" + file.w3cjs.messages.length + " errors)\n";
      }
    }));
});

gulp.task('html', ['w3validate', ]);

gulp.task('sass', function() {
  return gulp.src( sassSources )
    .pipe(customPlumber('Error Running Sass'))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulpif( !devMode, minifyCSS({compatibility: 'ie8'})))
    .pipe(gulp.dest( outputDir + 'css' ))
    .pipe(browserSync.reload({
      stream: true
    }));
})

gulp.task('js', function() {
  return gulp.src( jsSources )
    .pipe(customPlumber('Error Running JS'))
    .pipe(jshint('./.jshintrc'))
    .pipe(notify(function (file) {
      if (!file.jshint.success) {
        return file.relative + " (" + file.jshint.results.length + " errors)\n";
      }
    }))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(concat('script.js'))
    .on('error', gutil.log)
    .pipe(gulpif( !devMode, uglify()))
    .pipe(gulp.dest(outputDir + 'js'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('serve', ['html', 'sass', 'js', 'watch'], function() {
  browserSync.init({
    server: {
      baseDir: outputDir
    },
    port: 8080
  });
});

gulp.task('default', ['serve']);

gulp.task('watch', function() {
  gulp.watch(htmlSources, ['html']);
  gulp.watch('app/partials/**/*.htm', ['html']);
  gulp.watch(outputDir + '**/*.html').on('change', browserSync.reload);
  gulp.watch(sassSources, ['sass']);
  gulp.watch(jsSources, ['js']);
});

function customPlumber(errTitle) {
  return plumber({
    errorHandler: notify.onError({
      // Customizing error title
      title: errTitle || "Error running Gulp",
      message: "Error: <%= error.message %>",
      sound: "Glass"
    })
  });
}
