var gulp = require('gulp');
var eclint = require('../');

module.exports = function() {
	var hasErrors = false;
	var stream = gulp.src([
			'*.ts',
			'*.js',
			'*.json',
			'*.md',
			'bin/*.js',
			'tasks/*.js',
			'lib/**/*.ts'
		])
		.pipe(eclint.check({
			reporter: function(file, message) {
				hasErrors = true;
				console.error(file.path + ':', message);
			}
		}));
	stream.on('finish', function() {
		if (hasErrors) {
			process.exit(1);
		}
	});
	return stream;
};
