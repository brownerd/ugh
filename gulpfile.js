var pkg = require('./package.json'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    rimraf = require('gulp-rimraf'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    jade = require('gulp-jade'),
    stylus = require('gulp-stylus'),
    //nib = require('nib'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-csso'),
    through = require('through'),
    opn = require('opn'),
    ghPages = require('gulp-gh-pages'),
    path = require('path'),
    isDist = process.argv.indexOf('serve') === -1,
    evilIcons = require("gulp-evil-icons");

var browserSync = require('browser-sync').create();

gulp.task('js', ['clean:js'], function() {
  return gulp.src('src/scripts/main.js')
    .pipe(isDist ? through() : plumber())
    .pipe(browserify({ transform: ['debowerify'], debug: !isDist }))
    .pipe(isDist ? uglify() : through())
    .pipe(rename('build.js'))
    .pipe(gulp.dest('dist/build'))
    .pipe(browserSync.stream());
});

gulp.task('html', ['clean:html'], function() {
  return gulp.src('src/index.jade')
    .pipe(isDist ? through() : plumber())
    .pipe(jade({ pretty: true }))
    .pipe(evilIcons())
    .pipe(rename('index.html'))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());
});

gulp.task('css', ['clean:css'], function() {
  return gulp.src('src/styles/main.styl')
    .pipe(isDist ? through() : plumber())
    .pipe(stylus({
      //use: nib(),
      // Allow CSS to be imported from node_modules and bower_components
      'include css': true,
      'paths': ['./node_modules', './bower_components']
    }))
    .pipe(autoprefixer('last 2 versions', { map: false }))
    .pipe(isDist ? csso() : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('dist/build'))
    .pipe(browserSync.stream());
});

gulp.task('images', ['clean:images'], function() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.stream());
});

gulp.task('clean', function() {
  return gulp.src('dist')
    .pipe(rimraf());
});

gulp.task('clean:html', function() {
  return gulp.src('dist/index.html')
    .pipe(rimraf());
});

gulp.task('clean:js', function() {
  return gulp.src('dist/build/build.js')
    .pipe(rimraf());
});

gulp.task('clean:css', function() {
  return gulp.src('dist/build/build.css')
    .pipe(rimraf());
});

gulp.task('clean:images', function() {
  return gulp.src('dist/images')
    .pipe(rimraf());
});



// Static Server + watching scss/html files
gulp.task('browser-sync', ['build'], function() {

      browserSync.init({
          server: "./dist"
      });

      gulp.watch('src/**/*.jade', ['html']);
      gulp.watch('src/styles/**/*.styl', ['css']);
      gulp.watch('src/images/**/*', ['images']);
      gulp.watch([
        'src/scripts/**/*.js',
        'bespoke-theme-*/dist/*.js' // Allow themes to be developed in parallel
      ], ['js']);

      gulp.watch("app/scss/*.scss", ['sass']);
      gulp.watch("src/**/*").on('change', browserSync.reload);
  });


// gulp.task('deploy', ['build'], function(done) {
//   ghpages.publish(path.join(__dirname, 'dist'), { logger: gutil.log }, done);
// });

gulp.task('deploy', ['build'],  function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

gulp.task('build', ['js', 'html', 'css', 'images']);
gulp.task('serve', ['browser-sync']);
gulp.task('default', ['build']);
