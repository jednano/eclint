import * as fs from 'fs-extra';
import * as getStream from 'get-stream';
import * as os from 'os';
import * as path from 'path';
import * as PluginError from 'plugin-error';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as through from 'through2';
import * as common from './test-common';
const expect = common.expect;
/* tslint:disable:no-unused-expression */

function noop() {
	return through.obj();
}

function eclint(args, stubs?) {
	const argv = proxyquire('./cli', stubs || {
		'gulp-reporter': noop,
		'gulp-tap': (callback) => {
			log = sinon.stub(console, 'log');
			callback({
				contents: 'test: console.mock',
			});
			expect(log.lastCall.args).to.be.deep.equal(['test: console.mock']);
			log.restore();
			return noop();
		},
	})(args);
	// const argv = require('./cli')(args);
	if (argv.stream) {
		argv.then = (...promiseArgs) => getStream.array(argv.stream).then(...promiseArgs);
	}
	return argv;
}

let exit;
let log;
describe('eclint cli', function() {
	this.timeout(6000);
	beforeEach(() => {
		exit = sinon.stub(process, 'exit');
		process.exitCode = 0;
	});

	afterEach(() => {
		process.exitCode = 0;
		exit.restore();
		if (log) {
			log.restore();
		}
	});

	it('Missing sub-command', () => {
		log = sinon.stub(console, 'error');
		const yargs = eclint([]);
		expect(log.lastCall.args).to.have.lengthOf(1);
		sinon.assert.calledWith(log, 'CommandError: Missing required sub-command.');
		expect(yargs.stream).to.be.not.ok;
		log.restore();
	});

	it('thomas-lebeau/gulp-gitignore#2', async () => {
		let hostsFile;
		if (os.platform() === 'win32') {
			hostsFile = path.join(process.env.SystemRoot, 'System32/drivers/etc/hosts');
		} else {
			hostsFile = '/etc/hosts';
		}
		const cwd = process.cwd();
		process.chdir(path.resolve(hostsFile, '/'));
		const files = await eclint(['check', hostsFile]);
		process.chdir(cwd);
		expect(files).to.have.length.above(0);
	});

	describe('check', () => {
		it('All Files', async () => {
			let files = await eclint(['check']);
			files = files.map((file) => file.path);
			expect(files).to.have.length.above(10);
			expect(files).that.include(path.resolve(__dirname, '../.gitignore'));
		});
		it('Directories', async () => {
			const files = await eclint(['check', 'locales']);
			expect(files).to.have.length.above(2);
		});
		it('README.md', async () => {
			const files = await eclint(['check', 'README.md']);
			expect(files).to.have.lengthOf(1);
		});
		it('images/*', async () => {
			const files = await eclint(['check', 'images/**/*']);
			expect(files).have.lengthOf(0);
		});
		it('node_modules/.bin/_mocha', async () => {
			const files = await eclint(['check', 'node_modules/.bin/_mocha']);
			expect(files).have.lengthOf(1);
			expect(files[0]).haveOwnProperty('editorconfig').haveOwnProperty('errors').to.have.length.above(1);
		});
		it('not_exist.*', async () => {
			const result = eclint(['check', 'not_exist.*']);
			let errListener = result.stream.listeners('error');
			errListener = errListener[errListener.length - 1];
			log = sinon.stub(console, 'error');
			errListener(new Error('test: console.mock'));
			expect(log.lastCall.args).to.have.lengthOf(1);
			expect(log.lastCall.args[0]).to.be.match(/Error: test: console\.mock/);
			log.reset();
			errListener(new PluginError('gulp-reporter', 'test: console.mock'));
			expect(log.lastCall).to.be.null;
			log.restore();
			process.exitCode = 0;
			const files = await result;
			expect(files).have.lengthOf(0);
		});
		it('error of gulp-exclude-gitignore', () => {
			return expect(() => {
				eclint(['check', '/etc/hosts'], {
					'gulp-exclude-gitignore': () => {
						throw new Error('test: gulp-exclude-gitignore mock');
					},
				});
			}).throws('test: gulp-exclude-gitignore mock');
		});
	});
	describe('infer', () => {

		it('lib/**/*', async () => {
			const files = await eclint(['infer', '--ini', 'lib/**/*']);
			expect(files).have.lengthOf(1);
			expect(files[0].contents.toString()).to.be.match(/\bindent_style = tab\b/);
		});
		it('README.md', async () => {
			const files = await eclint(['infer', 'README.md']);
			expect(files).have.lengthOf(1);
			const result = JSON.parse(files[0].contents);
			expect(result).haveOwnProperty('end_of_line').and.equal('lf');
			expect(result).haveOwnProperty('insert_final_newline').and.to.be.ok;
		});
		it('All Files', async () => {
			const files = await eclint(['infer']);
			expect(files).have.lengthOf(1);
			const result = JSON.parse(files[0].contents);
			expect(result).to.deep.equal({
				charset: '',
				end_of_line: 'lf',
				indent_size: 0,
				indent_style: 'tab',
				insert_final_newline: true,
				max_line_length: 80,
				trim_trailing_whitespace: true,
			});
		});
	});

	describe('fix', () => {
		it('README.md', async () => {
			const files = await eclint(['fix', 'README.md']);
			expect(files).to.have.lengthOf(1);
		});
		if (os.tmpdir && fs.mkdtemp) {
			it('All Files with `--dest`', async () => {
				const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eclint-'));
				expect(tmpDir).to.be.ok.and.be.a('string');
				const files = await eclint(['fix', '--dest', tmpDir]);
				expect(files).to.have.length.above(10);
			});
		}
		it('All Files', async () => {
			const files = await eclint(['fix']);
			expect(files).to.have.length.above(10);
		});
	});

	it('thomas-lebeau/gulp-gitignore#2', async () => {
		const files = await eclint(['check', 'dist/cli.js'], {
			'gulp-gitignore': () => [],
			'gulp-reporter': noop,
			'gulp-tap': noop,
		});
		expect(files).to.have.length.above(0);
	});
});
