import common = require('./test-common');
import eclint = require('./eclint');
import File = require('vinyl');
import path = require('path');

// ReSharper disable WrongExpressionStatement
describe('eclint gulp plugin', () => {
	it('basic', (done) => {
		var stream = eclint.check();

		stream.on('data', function(file) {
			console.log(file);
			console.log(file.editorconfig);
			done();
		});

		stream.write(new File({
			path: path.join(__dirname, "testcase.js"),
			contents: new Buffer('testcase')
		}));
	});
});
