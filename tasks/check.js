var path = require('path');
var gulp = require('gulp');
var eclint = require('../');

module.exports = function() {
	var hasErrors = false;
	var stream = gulp.src([
			'*',
			'!eclint.sln*',
			'!eclint.v12.suo',
			'bin/*.js',
			'tasks/*.js',
			'lib/**/*.ts'
		])
		.pipe(eclint.check({
			reporter: function(file, message) {
				hasErrors = true;
				var relativePath = path.relative('.', file.path);
				console.error(relativePath + ':', message);
			}
		}));
	stream.on('finish', function() {
		if (hasErrors) {
			process.exit(1);
		}
	});
	return stream;
};
