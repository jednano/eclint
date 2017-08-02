import common = require('./test-common');
import sinon = require('sinon');
import path = require('path');
import os = require('os');
import fs = require('fs-extra');
import gutil = require('gulp-util');
import proxyquire = require('proxyquire');
import getStream = require('get-stream');
const expect = common.expect;

function eclint(args) {
	const argv = proxyquire('./cli', {
		'gulp-tap': (callback) => {
			log = sinon.stub(console, 'log');
			callback({
				contents: 'test: console.mock',
			});
			expect(log.lastCall.args).to.be.deep.equal(['test: console.mock']);
			log.restore();
			return gutil.noop();
		},
		'gulp-reporter': gutil.noop,
	})(args);
	// const argv = require('./cli')(args);
	if (argv.stream) {
		argv.then = (...args) => getStream.array(argv.stream).then(...args);
	}
	return argv;
}

let exit;
let log;
describe('eclint cli', function() {
	this.timeout(6000);
	beforeEach(function () {
		exit = sinon.stub(process, 'exit');
		process.exitCode = 0;
	});

	afterEach(function () {
		process.exitCode = 0;
		exit.restore();
	});

	it('Missing sub-command', () => {
		const yargs = eclint([]);
		expect(yargs.stream).to.be.not.ok;
	});

	describe('check', () => {
		it('All Files', () => {
			return eclint(['check']).then(files => {
				expect(files).to.have.length.above(10);
			});
		});
		it('Directories', () => {
			return eclint(['check', 'locales']).then(files => {
				expect(files).to.have.length.above(2);
			});
		});
		it('README.md', () => {
			return eclint(['check', 'README.md']).then(files => {
				expect(files).to.have.lengthOf(1);
			});
		});
		it('images/*', () => {
			return eclint(['check', 'images/**/*']).then(files => {
				expect(files).have.lengthOf(0);
			});
		});
		it('node_modules/.bin/_mocha', () => {
			return eclint(['check', 'node_modules/.bin/_mocha']).then(files => {
				expect(files).have.lengthOf(1);
				expect(files[0]).haveOwnProperty('editorconfig').haveOwnProperty('errors').to.have.length.above(1);
			});
		});
		it('not_exist.*', () => {
			const result = eclint(['check', 'not_exist.*']);
			let errListener = result.stream.listeners('error');
			errListener = errListener[errListener.length - 1];
			log = sinon.stub(console, 'error');
			errListener(new Error('test: console.mock'));
			expect(log.lastCall.args).to.have.lengthOf(1);
			expect(log.lastCall.args[0]).to.be.match(/Error: test: console\.mock/);
			log.reset();
			errListener(new gutil.PluginError('gulp-reporter', 'test: console.mock'));
			expect(log.lastCall).to.be.null;
			log.restore();
			process.exitCode = 0;
			return result.then(files => {
				expect(files).have.lengthOf(0);
			});
		});
	});
	describe('infer', function() {

		it('lib/**/*', () => {
			return eclint(['infer', '--ini', 'lib/**/*']).then(files => {
				expect(files).have.lengthOf(1);
				expect(files[0].contents.toString()).to.be.match(/\bindent_style = tab\b/);
			});
		});
		it('README.md', () => {
			return eclint(['infer', 'README.md']).then(files => {
				expect(files).have.lengthOf(1);
				const result = JSON.parse(files[0].contents);
				expect(result).haveOwnProperty('end_of_line').and.equal('lf');
				expect(result).haveOwnProperty('insert_final_newline').and.to.be.ok;
			});
		});
		it('All Files', () => {
			return eclint(['infer']).then(files => {
				expect(files).have.lengthOf(1);
				const result = JSON.parse(files[0].contents);
				expect(result).to.deep.equal({
					'charset': '',
					'indent_style': 'tab',
					'indent_size': 0,
					'trim_trailing_whitespace': true,
					'end_of_line': 'lf',
					'insert_final_newline': true,
					'max_line_length': 80
				});
			});
		});
	});
	describe('fix', function() {
		it('README.md', () => {
			eclint(['fix', 'README.md']).then(files => {
				expect(files).to.have.lengthOf(1);
			});
		});
		if (os.tmpdir && fs.mkdtemp) {
			it('All Files with `--dest`', () => {
				return fs.mkdtemp(path.join(os.tmpdir(), 'eclint-')).then(tmpDir => {
					expect(tmpDir).to.be.ok.and.be.a('string');
					return eclint(['fix', '--dest', tmpDir]);
				}).then(files => {
					expect(files).to.have.length.above(10);
				});
			});
		}
		it('All Files', () => {
			eclint(['fix']).then(files => {
				expect(files).to.have.length.above(10);
			});
		});
	});

});
