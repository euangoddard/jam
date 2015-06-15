// Regular NPM dependencies
var argv = require('minimist')(process.argv.slice(2));
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var del = require('del');
var source = require('vinyl-source-stream');
var stylish = require('jshint-stylish');

// Gulp dependencies
var autoprefixer = require('gulp-autoprefixer');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var inject = require('gulp-inject');
var jshint = require('gulp-jshint');
var ngAnnotate = require('gulp-ng-annotate');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');


var CONFIG = {
  is_release: !!argv.release
};


gulp.task('clean', function () {
  del.sync(['./dist']);
});


gulp.task('build-js', function () {
  var b = browserify({
    entries: ['./src/js/main.js'],
    debug: false
  });
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(ngAnnotate())
    .pipe(gulpif(CONFIG.is_release, uglify()))
    .pipe(gulp.dest('./dist/js'));
});


gulp.task('sass', function () {
  var output_style = CONFIG.is_release ? 'compressed' : 'expanded';

  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass({
      outputStyle: output_style
    }).on('error', gutil.log))
    .pipe(autoprefixer({browsers: [
    	'last 2 versions'
    ]}))
    .pipe(gulp.dest('./dist/css'));
});


gulp.task('copy-partials', function () {
  gulp.src('./src/partials/**/*.html')
    .pipe(gulp.dest('./dist/partials'));
});


gulp.task('copy-sounds', function () {
  gulp.src('./src/sounds/**/*.{m4a,ogg}')
    .pipe(gulp.dest('./dist/sounds'));
});


gulp.task('copy-images', function () {
  gulp.src('./src/img/**/*')
    .pipe(gulp.dest('./dist/img'));
});


gulp.task('build-html', ['build-js', 'sass'], function () {
  var target = gulp.src('./src/index.html');
  var sources = gulp.src([
    './dist/js/**/*.js',
    './dist/css/**/*.css'
  ], {read: false});

  return target.pipe(inject(sources, {ignorePath: '/dist/'}))
    .pipe(gulp.dest('./dist'));
});


gulp.task('lint', function() {
  return gulp.src('./src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});


gulp.task('build', ['build-html', 'copy-partials', 'copy-images', 'copy-sounds']);


gulp.task('watch', ['build', 'lint'], function () {
    gulp.watch(['./src/**/*', './gulpfile.js'], ['build', 'lint']);
});


gulp.task('default', ['build']);
