var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');

function test(done) {
	gulp.src(['js/**/*.js', '!**/*.spec.js'])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('finish', function() {
			var err;
			gulp.src(['js/**/*.spec.js'], { read: false })
				.pipe(plumber({
					errorHandler: function(err2) {
						err = err2;
					}
				}))
				.pipe(mocha({
					reporter: 'spec',
					clearRequireCache: true
				}))
				.pipe(istanbul.writeReports({
					reporters: ['lcov']
				}))
				.on('end', function() {
					done(err);
				});
		});
}

module.exports = test;
