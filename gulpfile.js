var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');

var paths = {
  'src': 'src/',
  'js': 'assets/',
  'css': 'assets/',
}

gulp.task('js', function() {
  return gulp.src(paths.src + '**/*.js')
    .pipe(uglify())
    .on('error', function(err) {
      console.log(err.message);
    })
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(paths.css));
});

gulp.task('scss', function() {
  return gulp.src(paths.src + '**/*.scss')
    .pipe(sass())
    .on('error', function(err) {
      console.log(err.message);
    })
    .pipe(cleanCss())
    .on('error', function(err) {
      console.log(err.message);
    })
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(paths.css));
});

gulp.task('css', function() {
  return gulp.src(paths.src + '**/*.css')
    .pipe(cleanCss())
    .on('error', function(err) {
      console.log(err.message);
    })
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(paths.css));
});

gulp.task('default', ['js', 'scss', 'css']);
