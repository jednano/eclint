var gulp = require('gulp');
var tslint = require('gulp-tslint');

module.exports = function() {
	return gulp.src('lib/**/*.ts')
		.pipe(tslint({
			formatter: 'prose'
		}))
		.pipe(tslint.report({
			emitError: false
		}));
};
