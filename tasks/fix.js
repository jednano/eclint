var gulp = require('gulp');
var eclint = require('../');

module.exports = function() {
	return gulp.src([
			'*',
			'!eclint.sln*',
			'!eclint.v12.suo',
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
