var gulp = require('gulp');
var eclint = require('../');

module.exports = function() {
	return gulp.src([
			'*.ts',
			'*.js',
			'*.json',
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
