import gutil = require('gulp-util');
import common = require('./test-common');
import eclint = require('./eclint');
import vfs = require('vinyl-fs');
import File = require('vinyl');
import path = require('path');

var expect = common.expect;

// ReSharper disable WrongExpressionStatement
describe('eclint gulp plugin', () => {
	describe('fix file', () => {

		it('fix by default options', (done) => {
			vfs.src('*.sln*', {
				stripBOM: false
			}).pipe(eclint.fix()).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig.fixed).to.be.ok;
				expect(file.editorconfig.errors).to.have.lengthOf(0);
			}).on('end', () => {
				done();
			}).on('error', done);
		});

		it('check after fix', (done) => {
			var errors = [];
			vfs.src('*.sln*', {
				stripBOM: false
			}).pipe(eclint.fix()).pipe(eclint.check({
				reporter: function(file) {
					errors.push(file);
				}
			})).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig).to.be.ok;
				expect(file.editorconfig.fixed).to.be.ok;
				expect(file.editorconfig.errors).to.have.lengthOf(0);
			}).on('end', () => {
				expect(errors).to.have.lengthOf(0);
				done();
			}).on('error', done);
		});

		it('should skip null', (done) => {
			vfs.src('lib', {
				stripBOM: false
			}).pipe(eclint.fix()).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig).not.to.be.ok;
			}).on('end', () => {
				done();
			}).on('error', done);
		});

		it('should skip stream', (done) => {
			vfs.src('*.sln*', {
				buffer: false,
				stripBOM: false
			}).pipe(eclint.fix()).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig).not.to.be.ok;
			}).on('error', (error: gutil.PluginError) => {
				expect(error.message).to.be.equal('Streams are not supported');
				expect(error.plugin).to.be.equal('ECLint');
				done();
			});
		});

	});

	describe('check file', () => {

		it('should skip null', (done) => {
			vfs.src('lib', {
				stripBOM: false
			}).pipe(eclint.check()).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig).not.to.be.ok;
			}).on('end', () => {
				done();
			}).on('error', done);
		});

		it('should skip stream', (done) => {
			vfs.src('*.sln*', {
				buffer: false,
				stripBOM: false
			}).pipe(eclint.check()).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig).not.to.be.ok;
			}).on('error', (error: gutil.PluginError) => {
				expect(error.message).to.be.equal('Streams are not supported');
				expect(error.plugin).to.be.equal('ECLint');
				done();
			});
		});

		it('fix after check', (done) => {
			var errors = [];
			vfs.src('*.sln*', {
				stripBOM: false
			}).pipe(eclint.check({
				reporter: function(file) {
					errors.push(file);
				}
			})).pipe(eclint.fix()).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig).to.be.ok;
				expect(file.editorconfig.fixed).to.be.ok;
				expect(file.editorconfig.errors).to.have.lengthOf(1);
			}).on('end', () => {
				expect(errors).to.have.length.above(1);
				done();
			}).on('error', done);
		});

	});

	describe('charset rule', () => {

		it('invalid charset: utf-8-bom, expected: utf-8', (done) => {
			var result = [];
			vfs.src('*.sln*', {
				stripBOM: false
			}).pipe(eclint.check()).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig.errors).to.have.lengthOf(1);
				var error = file.editorconfig.errors[0];
				expect(error.lineNumber).to.equal(1);
				expect(error.columnNumber).to.equal(1);
				expect(error.name).to.equal('EditorConfigError');
				expect(error.message).to.equal('invalid charset: utf-8-bom, expected: utf-8');
				expect(error.rule).to.equal('charset');
				expect(error.source).to.have.length.above(1);
				expect(error.fileName).to.equal(file.path);
				expect(error.inspect()).to.match(/^EditorConfigError:/);
				expect(error.inspect()).to.match(/\s+at\s+/);
				result.push(file);
			}).on('end', () => {
				expect(result).to.have.length.above(1);
				done();
			}).on('error', done);
		});

	});

	describe('end_of_line rule', () => {

		it('invalid newline: crlf, expected: lf', (done) => {
			var stream = eclint.check();

			stream.on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig.errors).to.have.lengthOf(1);
				var error = file.editorconfig.errors[0];
				expect(error.lineNumber).to.equal(1);
				expect(error.columnNumber).to.equal(9);
				expect(error.name).to.equal('EditorConfigError');
				expect(error.message).to.equal('invalid newline: crlf, expected: lf');
				expect(error.rule).to.equal('end_of_line');
				expect(error.source).to.equal('testcase\r\n');
				expect(error.fileName).to.equal(file.path);
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				path: path.join(__dirname, "testcase.js"),
				contents: new Buffer('testcase\r\n')
			}));
		});

	});

	describe('insert_final_newline rule', () => {

		it('expected final newline', (done) => {
			var stream = eclint.check();

			stream.on('data', (file) => {
				expect(file.editorconfig.errors).to.have.lengthOf(1);
				var error = file.editorconfig.errors[0];
				expect(error.lineNumber).to.equal(1);
				expect(error.name).to.equal('EditorConfigError');
				expect(error.message).to.equal('expected final newline');
				expect(error.rule).to.equal('insert_final_newline');
				expect(error.source).to.equal('testcase');
				expect(error.fileName).to.equal(file.path);
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				path: path.join(__dirname, "testcase.js"),
				contents: new Buffer('testcase')
			}));
		});

		it('unexpected final newline', (done) => {
			var stream = eclint.check({
				settings: {
					insert_final_newline: false
				}
			});

			stream.on('data', (file) => {
				expect(file.editorconfig.errors).to.have.lengthOf(1);
				var error = file.editorconfig.errors[0];
				expect(error.lineNumber).to.equal(1);
				expect(error.name).to.equal('EditorConfigError');
				expect(error.message).to.equal('unexpected final newline');
				expect(error.rule).to.equal('insert_final_newline');
				// expect(error.source).to.equal('');
				expect(error.fileName).to.equal(file.path);
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				path: path.join(__dirname, "testcase.js"),
				contents: new Buffer('testcase\n')
			}));
		});

	});
});
