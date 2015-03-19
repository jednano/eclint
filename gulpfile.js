var gulp = require('gulp');

gulp.task('default', ['lint'], require('./tasks/test'));
gulp.task('lint', ['check', 'tslint']);
gulp.task('check', ['build'], lazyLoadTask('check'));
gulp.task('tslint', loadTask('tslint'));
gulp.task('test', ['build'], require('./tasks/test'));
gulp.task('build', ['scripts']);
gulp.task('scripts', ['clean'], loadTask('scripts'));
gulp.task('clean', loadTask('clean'));
gulp.task('fix', ['build'], lazyLoadTask('fix'));

function loadTask(taskName) {
	return require('./tasks/' + taskName);
}

function lazyLoadTask(taskName) {
	return function() {
		return loadTask(taskName).apply(this, arguments);
	};
}
