var gulp = require('gulp');
var eclint = require('../');

module.exports = function() {
	return gulp.src([
			'*',
			'bin/*.js',
			'tasks/*.js',
			'lib/**/*.ts'
		],
		{
			base: './'
		})
		.pipe(eclint.fix())
		.pipe(gulp.dest('.'));
};
