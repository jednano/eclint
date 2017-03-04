import common = require('./test-common');
const execFile = require('child_process').execFile;
const cliPath = require.resolve('../bin/eclint');
const expect = common.expect;

// ReSharper disable WrongExpressionStatement
describe('eclint cli', function() {
	function eclint(args: string[], callback?: any) {
		args.unshift(cliPath);
		return execFile(process.execPath, args, callback);
	}
	this.timeout(8000);
	it('Missing sub-command', (done) => {
		eclint([], (error: Error) => {
			expect(error.message).to.be.match(/\bCommandError\b/);
			expect(error.message).to.be.match(/\bMissing required sub-command\b/);
			done();
		});
	});
	describe('check', () => {
		it('README.md', (done) => {
			eclint(['check', 'README.md'], done);
		});
		it('images/*', (done) => {
			eclint(['check', 'images/*'], done);
		});
		it('node_modules/.bin/_mocha', (done) => {
			eclint(['check', 'node_modules/.bin/_mocha'], (error: Error, stdout, stderr) => {
				console.error(error);
				console.error(stdout);
				console.error(stderr);
				expect(error.message).to.be.match(/\binvalid indentation\b/);
				done();
			});
		});
	});
	describe('infer', function() {
		it('lib/**/*', (done) => {
			eclint(['infer', '--ini', 'lib/**/*'], (error, stdout, stderr) => {
				if (error) {
					done(error);
				} else {
					expect(stdout).to.be.match(/\bindent_style = tab\b/);
					expect(stderr).not.to.be.ok;
					done();
				}
			});
		});
		it('README.md', (done) => {
			eclint(['infer', 'README.md'], done);
		});
		it('node_modules/.bin/_mocha', (done) => {
			eclint(['infer', 'node_modules/.bin/_mocha'], done);
		});
	});
});
