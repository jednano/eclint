var gulp = require('gulp');
var del = require('del');

module.exports = function() {
	gulp.task('clean', function(done) {
		del(['js', 'd.ts'], done);
	});
};
