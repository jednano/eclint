var gulp = require('gulp');

gulp.task('default', ['lint'], lazyLoadTask('test'));
gulp.task('lint', ['check', 'tslint']);
gulp.task('check', ['build'], lazyLoadTask('check'));
gulp.task('tslint', lazyLoadTask('tslint'));
gulp.task('test', ['build'], lazyLoadTask('test'));
gulp.task('build', ['scripts']);
gulp.task('scripts', ['clean'], lazyLoadTask('scripts'));
gulp.task('clean', lazyLoadTask('clean'));
gulp.task('fix', ['build'], lazyLoadTask('fix'));

function lazyLoadTask(taskName) {
	return function() {
		var task = require('./tasks/' + taskName);
		return task.apply(this, arguments);
	};
}
