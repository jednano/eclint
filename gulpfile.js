var gulp = require('gulp');

gulp.task('default', ['test']);
gulp.task('test', ['build'], require('./tasks/test'));
gulp.task('build', ['scripts']);
gulp.task('scripts', ['clean', 'tslint'], require('./tasks/scripts'));
gulp.task('clean', require('./tasks/clean'));
gulp.task('tslint', require('./tasks/tslint'));
