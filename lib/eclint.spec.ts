import common = require('./test-common');
import eclint = require('./eclint');
import vfs = require('vinyl-fs');
import File = require('vinyl');
import path = require('path');

var expect = common.expect;

// ReSharper disable WrongExpressionStatement
describe('eclint gulp plugin', () => {
	describe('charset rule', () => {

		it('invalid charset: utf-8-bom, expected: utf-8', (done) => {
			var result = [];
			vfs.src('*.sln*', {
				stripBOM: false
			}).pipe(eclint.check()).on('data', (file) => {
				expect(file.editorconfig.errors).to.have.lengthOf(1);
				var error = file.editorconfig.errors[0];
				expect(error.lineNumber).to.equal(1);
				expect(error.columnNumber).to.equal(1);
				expect(error.name).to.equal('EditorConfigError');
				expect(error.message).to.equal('invalid charset: utf-8-bom, expected: utf-8');
				expect(error.rule).to.equal('charset');
				expect(error.source).to.have.length.above(1);
				expect(error.fileName).to.equal(file.path);
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

			stream.on('data', (file) => {
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
