var gulp = require('gulp');
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var mocha = require('gulp-mocha');
var todo = require('gulp-todo');
var webpack = require('webpack-stream');
var fs = require('fs');


gulp.task('lint', function () {
  return gulp.src(['**/*.js', '!node_modules/**/*.js', '!bin/**/*.js'])
    .pipe(jshint({
          esnext: true
      }))
    .pipe(jshint.reporter('default', { verbose: true}))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test',  gulp.series('lint'), function () {
    gulp.src(['test/**/*.js'])
        .pipe(mocha());
});

gulp.task('move-client', function () {
  return gulp.src(['src/client/**/*.*', '!client/js/*.js'])
    .pipe(gulp.dest('./bin/client/'));
});

gulp.task('build-client',  gulp.series('lint', 'move-client'), function () {
  return gulp.src(['src/client/js/app.js'])
    .pipe(uglify())
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(babel({
      presets: [
        ['es2015', { 'modules': false }]
      ]
    }))
    .pipe(gulp.dest('bin/client/js/'));
});

gulp.task('build-server', gulp.series('lint'), function () {
  return gulp.src(['src/server/**/*.*', 'src/server/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('bin/server/'));
});

gulp.task('build',  gulp.series('build-client', 'build-server', 'test'));

gulp.task('watch',  gulp.series('build', function () {
  gulp.watch(['src/client/**/*.*'], ['build-client', 'move-client']);
  gulp.watch(['src/server/*.*', 'src/server/**/*.js'], ['build-server']);
  gulp.start('run-only');
}));

gulp.task('todo',  gulp.series('lint', function() {
  gulp.src('src/**/*.js')
      .pipe(todo())
      .pipe(gulp.dest('./'));
}));

gulp.task('run',  gulp.series('build', function () {
    nodemon({
        delay: 10,
        script: './server/server.js',
        cwd: "./bin/",
        args: ["config.json"],
        ext: 'html js css'
    })
    .on('restart', function () {
        util.log('server restarted!');
    });
}));

gulp.task('run-only', function () {
    nodemon({
        delay: 10,
        script: './server/server.js',
        cwd: "./bin/",
        args: ["config.json"],
        ext: 'html js css'
    })
    .on('restart', function () {
        util.log('server restarted!');
    });
});


gulp.task('default', gulp.series('run'));
