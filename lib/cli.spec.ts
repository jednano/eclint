import common = require('./test-common');
import path = require('path');
import os = require('os');
import fs = require('fs');
const execFile = require('child_process').execFile;
const cliPath = require.resolve('../bin/eclint');
const expect = common.expect;

describe('eclint cli', function() {
	function eclint(args: string[], callback?: any) {
		args.unshift(cliPath);
		return execFile(process.execPath, args, callback);
	}
	this.timeout(80000);
	it('Missing sub-command', (done) => {
		eclint([], (error: Error) => {
			expect(error.message).to.be.match(/\bCommandError\b/);
			expect(error.message).to.be.match(/\bMissing required sub-command\b/);
			done();
		});
	});
	describe('check', () => {
		it('All Files', (done) => {
			eclint(['check'], done);
		});
		it('Directories', (done) => {
			eclint(['check', 'locales'], done);
		});
		it('README.md', (done) => {
			eclint(['check', 'README.md'], done);
		});
		it('images/*', (done) => {
			eclint(['check', 'images/*'], done);
		});
		it('node_modules/.bin/_mocha', (done) => {
			eclint(['check', 'node_modules/.bin/_mocha'], (error: Error) => {
				expect(error.message).to.be.match(/\(EditorConfig indent_style\b/);
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
		it('All Files', (done) => {
			eclint(['infer'], (error, stdout, stderr) => {
				if (error) {
					done(error);
				} else {
					expect(JSON.parse(stdout)).to.deep.equal({
						'charset': '',
						'indent_style': 'tab',
						'indent_size': 0,
						'trim_trailing_whitespace': true,
						'end_of_line': 'lf',
						'insert_final_newline': true,
						'max_line_length': 80
					});
					expect(stderr).not.to.be.ok;
					done();
				}
			});
		});
	});
	describe('fix', function() {
		it('README.md', (done) => {
			eclint(['fix', 'README.md'], done);
		});
		if (os.tmpdir) {
			it('All Files with `--dest`', (done) => {
				var tmpDir = path.join(os.tmpdir(), 'eclint');
				fs.unlink(tmpDir, () => {
					eclint(['fix', '--dest', tmpDir], (error) => {
						if (error) {
							done(error);
						} else {
							fs.stat(path.join(tmpDir, 'README.md'), (error, stat) => {
								expect(stat).to.be.ok;
								done(error);
							});
						}
					});
				});
			});
		}
		it('All Files', (done) => {
			eclint(['fix'], done);
		});
	});
});
