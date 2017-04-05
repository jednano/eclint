import gutil = require('gulp-util');
import common = require('./test-common');
import eclint = require('./eclint');
import vfs = require('vinyl-fs');
import File = require('vinyl');
import path = require('path');

var expect = common.expect;

describe('eclint gulp plugin', () => {
	before(() => {
		eclint.configure({
			newlines: ['\n', '\r\n']
		});
	});
	describe('fix file', () => {

		it('fix by default options', (done) => {
			var stream = eclint.fix();

			stream.on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig).to.be.ok;
				expect(file.editorconfig.fixed).to.be.ok;
				expect(file.editorconfig.errors).to.have.lengthOf(0);
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				path: path.join(__dirname, 'testcase.js'),
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a])
			}));
		});

		it('checks after fix', (done) => {
			var stream = eclint.fix();

			stream.pipe(eclint.check()).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig).to.be.ok;
				expect(file.editorconfig.fixed).to.be.ok;
				expect(file.editorconfig.errors).to.have.lengthOf(0);
				done();
			}).on('error', done);

			stream.write(new File({
				path: path.join(__dirname, 'testcase.js'),
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a])
			}));
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

		it('should error for stream', (done) => {
			vfs.src('package.json', {
				buffer: false,
				stripBOM: false
			}).pipe(eclint.fix()).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig).not.to.be.ok;
			}).on('error', (error: gutil.PluginError) => {
				expect(error.message).to.be.equal('Streams are not supported');
				expect(error.plugin).to.be.equal('ECLint');
				expect(error.showStack).to.be.false;
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

		it('should error for stream', (done) => {
			vfs.src('package.json', {
				buffer: false,
				stripBOM: false
			}).pipe(eclint.check()).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig).not.to.be.ok;
			}).on('error', (error: gutil.PluginError) => {
				expect(error.message).to.be.equal('Streams are not supported');
				expect(error.plugin).to.be.equal('ECLint');
				expect(error.showStack).to.be.false;
				done();
			});
		});

		it('fixes after check', (done) => {
			var stream = eclint.check();

			stream.pipe(eclint.fix()).on('data', (file: eclint.EditorConfigLintFile) => {
				expect(file.editorconfig).to.be.ok;
				expect(file.editorconfig.fixed).to.be.ok;
				expect(file.editorconfig.errors).to.have.lengthOf(1);
				done();
			}).on('error', done);

			stream.write(new File({
				path: path.join(__dirname, 'testcase.js'),
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a])
			}));
		});

		it('options.reporter', (done) => {
			var stream = eclint.check({
				reporter: (_file: eclint.EditorConfigLintFile, error: Error) => {
					expect(error.message).to.have.equal('invalid charset: utf-8-bom, expected: utf-8');
					done();
				}
			});

			stream.write(new File({
				path: path.join(__dirname, 'testcase.js'),
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a])
			}));
		});

	});

	describe('charset rule', () => {

		it('invalid charset: utf-8-bom, expected: utf-8', (done) => {
			var stream = eclint.check();

			stream.on('data', (file: eclint.EditorConfigLintFile) => {
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
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				path: path.join(__dirname, 'testcase.js'),
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a])
			}));
		});

	});

	describe('end_of_line rule', () => {

		it('throws invalid "invalid newline: crlf, expected: lf"', (done) => {
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
				path: path.join(__dirname, 'testcase.js'),
				contents: new Buffer('testcase\r\n')
			}));
		});

	});

	describe('insert_final_newline rule', () => {

		it('expects final newline', (done) => {
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
				path: path.join(__dirname, 'testcase.js'),
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
				expect(error.source.trim()).to.have.length.above(0);
				expect(error.fileName).to.equal(file.path);
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				path: path.join(__dirname, 'testcase.js'),
				contents: new Buffer('testcase\n')
			}));
		});

		it('check documentation comments', (done) => {
			var stream = eclint.check({
				settings: {
					indent_style: 'space',
					indent_size: '2'
				}
			});

			stream.on('data', (file) => {
				expect(file.editorconfig.errors).to.have.lengthOf(2);
				expect(file.editorconfig.errors[0].message).to.equal('invalid indent size: 1, expected: 2');
				expect(file.editorconfig.errors[0].lineNumber).to.equal(8);
				expect(file.editorconfig.errors[0].rule).to.equal('indent_size');
				expect(file.editorconfig.errors[1].message).to.equal('invalid indent size: 1, expected: 2');
				expect(file.editorconfig.errors[1].lineNumber).to.equal(9);
				expect(file.editorconfig.errors[1].rule).to.equal('indent_size');
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				path: path.join(__dirname, 'testcase.js'),
				contents: new Buffer(`  /**\n   * indent 1\n   */\n/**\n * indent 0\n */\n  /**\n  * indent 1\n  */\n`)
			}));
		});

	});
});
