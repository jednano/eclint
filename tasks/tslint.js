var gulp = require('gulp');
var tslint = require('gulp-tslint');

module.exports = function() {
	return gulp.src('lib/**/*.ts')
		.pipe(tslint())
		.pipe(tslint.report('prose', {
			emitError: false
		}));
};
