var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');
var jsonTransform = require('gulp-json-transform');
var jsonSass = require('gulp-json-sass');

var paths = {
  'src': './src/',
  'js': './assets/',
  'css': './assets/',
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

gulp.task('json2js', function() {
  jsonObjectName = "";
  return gulp.src(paths.src + '**/*.json')
    .pipe(rename(function(path) {
        jsonObjectName = path.basename;
        path.extname = '.js';
    }))
    .pipe(jsonTransform(function(data) {
        return jsonObjectName + '=' + JSON.stringify(data);
    }))
    .pipe(gulp.dest(paths.js));
});

gulp.task('json2sass', function() {
  return gulp.src(paths.src + '**/*.json')
    .pipe(jsonSass({
        delim: '-',
        sass: false,
        ignoreJsonErrors: true,
        escapeIllegalCharacters: true,
        prefixFirstNumericCharacter: true,
        firstCharacter: '_'
    }))
    .pipe(rename({ extname: '.sass' }))
    .pipe(gulp.dest(paths.src));
});

gulp.task('scss', function() {
  return gulp.src(paths.src + '**/*.scss')
    .pipe(sass({ includePaths: paths.src }))
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

gulp.task('default', gulp.series(['json2js', 'json2sass', 'js', 'css', 'scss']));
