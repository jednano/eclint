import * as editorconfig from 'editorconfig';
import * as path from 'path';
import * as PluginError from 'plugin-error';
import * as sinon from 'sinon';
import * as File from 'vinyl';
import * as vfs from 'vinyl-fs';
import * as eclint from './eclint';
import charset = require('./rules/charset');
import * as common from './test-common';
const expect = common.expect;
/* tslint:disable:no-unused-expression */

describe('eclint gulp plugin', () => {
	afterEach(() => {
		eclint.configure({
			newlines: ['\n', '\r\n'],
		});
	});
	describe('fix file', () => {

		it('fix by default options', (done) => {
			const stream = eclint.fix();

			stream.on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig).to.be.ok;
				expect(file.editorconfig.fixed).to.be.ok;
				expect(file.editorconfig.errors).to.have.lengthOf(0);
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a]),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('fix by "unset" options', (done) => {

			const stream = eclint.fix({
				settings: {
					charset: 'unset',
					end_of_line: 'unset',
					indent_style: 'unset',
				},
			});

			stream.on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig).to.be.ok;
				expect(file.editorconfig.fixed).to.be.ok;
				expect(file.editorconfig.errors).to.have.lengthOf(0);
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a]),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('checks after fix', (done) => {
			const stream = eclint.fix();

			stream.pipe(eclint.check()).on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig).to.be.ok;
				expect(file.editorconfig.fixed).to.be.ok;
				expect(file.editorconfig.errors).to.have.lengthOf(0);
				done();
			}).on('error', done);

			stream.write(new File({
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a]),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('should skip null', (done) => {
			vfs.src('lib', {
				stripBOM: false,
			}).pipe(eclint.fix()).on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig).not.to.be.ok;
			}).on('end', () => {
				done();
			}).on('error', done);
		});

		it('should error for stream', (done) => {
			vfs.src('package.json', {
				buffer: false,
				stripBOM: false,
			}).pipe(eclint.fix()).on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig).not.to.be.ok;
			}).on('error', (error: PluginError) => {
				expect(error.message).to.be.equal('Streams are not supported');
				expect(error.plugin).to.be.equal('ECLint');
				expect(error.showStack).to.be.false;
				done();
			});
		});

		it('fix block comment', (done) => {
			const stream = eclint.fix();

			stream.on('data', (file: File) => {
				expect(file.contents.toString()).to.be.equal([
					'\t/**',
					'\t * indent 1',
					'\t */',
					'/*',
					' * indent 0',
					' */',
					'\t/**',
					'\t * indent 1',
					'\t */',
					'',
				].join('\n'));
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				contents: new Buffer([
					'  /**',
					'    * indent 1',
					'  */',
					'/*',
					' * indent 0',
					' */',
					'  /**',
					'  * indent 1',
					'  */',
					'',
				].join('\n')),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('replaces leading 2-space soft tabs with hard tabs', (done) => {
			const stream = eclint.fix({
				settings: {
					indent_style: 'tab',
				},
			});

			stream.on('data', (file: File) => {
				expect(file.contents.toString()).to.be.equal([
					'foo',
					'\tbar',
					'foo',
					'',
				].join('\n'));
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				contents: new Buffer([
					'foo',
					'  bar',
					'foo',
					'',
				].join('\n')),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

	});

	describe('check file', () => {

		it('check by "unset" options', (done) => {

			const stream = eclint.check({
				settings: {
					charset: 'unset',
					end_of_line: 'unset',
					indent_style: 'unset',
				},
			});

			stream.on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig).to.be.ok;
				expect(file.editorconfig.errors).to.have.lengthOf(0);
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a]),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('should skip null', (done) => {
			vfs.src('lib', {
				stripBOM: false,
			}).pipe(eclint.check()).on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig).not.to.be.ok;
			}).on('end', () => {
				done();
			}).on('error', done);
		});

		it('should error for stream', (done) => {
			vfs.src('package.json', {
				buffer: false,
				stripBOM: false,
			}).pipe(eclint.check()).on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig).not.to.be.ok;
			}).on('error', (error: PluginError) => {
				expect(error.message).to.be.equal('Streams are not supported');
				expect(error.plugin).to.be.equal('ECLint');
				expect(error.showStack).to.be.false;
				done();
			});
		});

		it('fixes after check', (done) => {
			const stream = eclint.check();

			stream.pipe(eclint.fix()).on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig).to.be.ok;
				expect(file.editorconfig.fixed).to.be.ok;
				expect(file.editorconfig.errors).to.have.lengthOf(1);
				done();
			}).on('error', done);

			stream.write(new File({
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a]),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('options.reporter', (done) => {
			const stream = eclint.check({
				reporter: (_file: eclint.IEditorConfigLintFile, error: Error) => {
					expect(error.message).to.have.equal('invalid charset: utf-8-bom, expected: utf-8');
					done();
				},
			});

			stream.write(new File({
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a]),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('check block comment', (done) => {
			const stream = eclint.check();

			stream.on('data', (file: File) => {
				expect(file.editorconfig.errors).to.have.lengthOf(2);
				expect(file.editorconfig.errors[0].lineNumber).to.equal(1);
				expect(file.editorconfig.errors[0].columnNumber).to.equal(1);
				expect(file.editorconfig.errors[0].rule).to.equal('indent_style');

				expect(file.editorconfig.errors[1].lineNumber).to.equal(7);
				expect(file.editorconfig.errors[1].columnNumber).to.equal(1);
				expect(file.editorconfig.errors[1].rule).to.equal('indent_style');
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				contents: new Buffer([
					'  /**',
					'    * indent 1',
					'  */',
					'/*',
					' * indent 0',
					' */',
					'  /**',
					'  * indent 1',
					'  */',
					'',
				].join('\n')),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('check non doc block comment', (done) => {
			const stream = eclint.check({
				settings: {
					block_comment_end: '*/',
					block_comment_start: '/*',
					indent_size: 2,
					indent_style: 'space',
				},
			});

			stream.on('data', (file: File) => {
				expect(file.editorconfig.errors).to.have.lengthOf(0);
				done();
			});

			stream.on('error', done);

			stream.write(new File({
				contents: new Buffer([
					'function() {',
					'  /* block',
					'     comment */',
					'  function() {',
					'    /* block',
					'       comment */',
					'    function() {',
					'      /* block',
					'         comment */',
					'    }',
					'  }',
					'}',
					'',
				].join('\n')),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

	});

	describe('infer file', () => {
		it('README.md', (done) => {
			const stream = eclint.infer();
			stream.on('data', (file: File) => {
				const config = JSON.parse(String(file.contents));
				expect(config.indent_style).to.be.equal('space');
				expect(config.indent_size).to.be.equal(2);
				expect(config.trim_trailing_whitespace).to.be.equal(true);
				expect(config.end_of_line).to.be.equal('lf');
				done();
			});
			vfs.src('README.md').pipe(stream);
		});
		it('package.json', (done) => {
			const stream = eclint.infer();
			stream.on('data', (file: File) => {
				const config = JSON.parse(String(file.contents));
				expect(config.indent_style).to.be.equal('space');
				expect(config.indent_size).to.be.equal(2);
				expect(config.trim_trailing_whitespace).to.be.equal(true);
				expect(config.end_of_line).to.be.equal('lf');
				done();
			});
			vfs.src('package.json').pipe(stream);
		});
		it('package.json (score)', (done) => {
			const stream = eclint.infer({
				score: true,
			});
			stream.on('data', (file: File) => {
				const config = JSON.parse(String(file.contents));
				expect(config).haveOwnProperty('trim_trailing_whitespace').haveOwnProperty('true').above(100);
				done();
			});
			vfs.src('package.json').pipe(stream);
		});
		it('Cannot generate tallied scores as ini file format', () => {
			expect(() => {
				eclint.infer({
					ini: true,
					score: true,
				});
			}).to.throw('Cannot generate tallied scores as ini file format');
		});
		it('file is stream', (done) => {
			const stream = eclint.infer();
			stream.on('error', () => {
				done();
			});
			stream.write({
				isNull: () => false,
				isStream: () => true,
			});
		});
		it('file is null', () => {
			const stream = eclint.infer();
			stream.write({
				isNull: () => true,
				isStream: () => false,
			});

			expect(() => {
				stream.end();
			}).to.throw();
		});
		it('options.ini', (done) => {
			const stream = eclint.infer({
				ini: true,
			});
			stream.on('data', (file: File) => {
				const config = String(file.contents);
				expect(config).to.be.match(/^end_of_line = lf$/im);
				done();
			});
			vfs.src('README.md').pipe(stream);
		});
		it('options.root', (done) => {
			const stream = eclint.infer({
				ini: true,
				root: true,
			});
			stream.on('data', (file: File) => {
				const config = String(file.contents);
				expect(config).to.be.match(/^root = true$/im);
				done();
			});
			vfs.src('README.md').pipe(stream);
		});
	});

	describe('charset rule', () => {

		it('invalid charset: utf-8-bom, expected: utf-8', (done) => {
			const stream = eclint.check();

			stream.on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig.errors).to.have.lengthOf(1);
				const error = file.editorconfig.errors[0];
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
				contents: new Buffer([0xef, 0xbb, 0xbf, 0x74, 0x65, 0x73, 0x74, 0x63, 0x61, 0x73, 0x65, 0x0a]),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

	});

	describe('end_of_line rule', () => {

		it('throws invalid "invalid newline: crlf, expected: lf"', (done) => {
			const stream = eclint.check();

			stream.on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig.errors).to.have.lengthOf(1);
				const error = file.editorconfig.errors[0];
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
				contents: new Buffer('testcase\r\n'),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

	});

	describe('insert_final_newline rule', () => {

		it('expects final newline', (done) => {
			const stream = eclint.check();

			stream.on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig.errors).to.have.lengthOf(1);
				const error = file.editorconfig.errors[0];
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
				contents: new Buffer('testcase'),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('unexpected final newline', (done) => {
			const stream = eclint.check({
				settings: {
					insert_final_newline: false,
				},
			});

			stream.on('data', (file: eclint.IEditorConfigLintFile) => {
				expect(file.editorconfig.errors).to.have.lengthOf(1);
				const error = file.editorconfig.errors[0];
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
				contents: new Buffer('testcase\n'),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

	});

	it('eclint configure', () => {
		expect(() => {
			eclint.configure.call(null);
		}).not.to.throw();
	});
	describe('should plugin error', () => {
		let stub;

		afterEach(() => {
			if (stub) {
				stub.restore();
				stub = null;
			}
		});

		it('editorconfig.parse in eclint.check', (done) => {
			stub = sinon.stub(editorconfig, 'parse').rejects(new Error('check editorconfig testcase'));
			const stream = eclint.check();

			stream.on('error', (error: PluginError) => {
				expect(error).haveOwnProperty('plugin').and.to.be.equal('ECLint');
				expect(error).haveOwnProperty('message').and.to.be.equal('check editorconfig testcase');
				done();
			});

			stream.write(new File({
				contents: new Buffer('testcase'),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('charset.check', (done) => {
			stub = sinon.stub(charset, 'check').throws(new Error('check testcase'));
			const stream = eclint.check();

			stream.on('error', (error: PluginError) => {
				expect(error).haveOwnProperty('plugin').and.to.be.equal('ECLint');
				expect(error).haveOwnProperty('message').and.to.be.equal('check testcase');
				done();
			});

			stream.write(new File({
				contents: new Buffer('testcase'),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('editorconfig.parse in eclint.fix', (done) => {
			stub = sinon.stub(editorconfig, 'parse').rejects(new Error('fix editorconfig testcase'));
			const stream = eclint.fix();

			stream.on('error', (error: PluginError) => {
				expect(error).haveOwnProperty('plugin').and.to.be.equal('ECLint');
				expect(error).haveOwnProperty('message').and.to.be.equal('fix editorconfig testcase');
				done();
			});

			stream.write(new File({
				contents: new Buffer('testcase'),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('charset.fix', (done) => {
			stub = sinon.stub(charset, 'fix').throws(new Error('fix testcase'));
			const stream = eclint.fix();

			stream.on('error', (error: PluginError) => {
				expect(error).haveOwnProperty('plugin').and.to.be.equal('ECLint');
				expect(error).haveOwnProperty('message').and.to.be.equal('fix testcase');
				done();
			});

			stream.write(new File({
				contents: new Buffer('testcase'),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});

		it('charset.infer', (done) => {
			stub = sinon.stub(charset, 'infer').throws(new Error('infer testcase'));
			const stream = eclint.infer();

			stream.on('error', (error: PluginError) => {
				expect(error).haveOwnProperty('plugin').and.to.be.equal('ECLint');
				expect(error).haveOwnProperty('message').and.to.be.equal('infer testcase');
				done();
			});

			stream.write(new File({
				contents: new Buffer('testcase'),
				path: path.join(__dirname, 'testcase.js'),
			}));
		});
	});
});
