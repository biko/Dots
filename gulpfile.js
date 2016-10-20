'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var connect = require('gulp-connect');
var autoprefixer = require('gulp-autoprefixer');
var htmlmin = require('gulp-htmlmin');
var minify = require('gulp-minify');
var s3 = require("gulp-s3");
var uglify = require('gulp-uglify');
var pump = require('pump');
var cleanCSS = require('gulp-clean-css');
var inlinesource = require('gulp-inline-source');
var config = require('./config.json');


gulp.task('default', ['sass:watch', 'webserver']);
gulp.task('publish', ['sass', 'minify', 'compress', 'move', 'upload']);


gulp.task('sass', function () {
  return gulp.src('./static/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('./static/css/'));
});


gulp.task('sass:watch', function () {
  gulp.watch('./static/sass/*.scss', ['sass']);
});


gulp.task('webserver', function() {
  connect.server({
    port: 4444
  });
});


gulp.task('minify', function() {    
  return gulp.src('./index.html')   
    .pipe(htmlmin({collapseWhitespace: true})) 
    .pipe(inlinesource())   
    .pipe(gulp.dest('./Publish'))   
})

gulp.task('compress', function() {   
  gulp.src('./static/javascript/*.js')    
    .pipe(minify({    
      exclude: ['tasks'],   
      ignoreFiles: ['-min.js']    
  }))   
  .pipe(gulp.dest('./Publish/static/javascript'))   
});

gulp.task('move', function() {    
  gulp.src('./static/css/*.css')    
  .pipe(gulp.dest('./Publish/static/css'));   
  gulp.src('./static/fonts/**/*')   
  .pipe(gulp.dest('./Publish/static/fonts'));   
  gulp.src('./static/images/**/*')    
  .pipe(gulp.dest('./Publish/static/images'));
  gulp.src('./static/json/**/*')    
  .pipe(gulp.dest('./Publish/static/json'));
  gulp.src('./static/icons/**/*')    
  .pipe(gulp.dest('./Publish/static/icons'));        
});

gulp.task('upload', function() {    
  gulp.src('./Publish/**')    
    .pipe(s3({    
      "key": config.aws.key,    
      "secret": config.aws.secret,   
      "bucket": config.aws.bucket,   
      "region": config.aws.region   
    }));    
});