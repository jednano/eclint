import common = require('../test-common');
import _line = require('../line');
import rule = require('./max_line_length');

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;

// ReSharper disable WrongExpressionStatement
describe('max_line_length rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe.skip('check command', () => {
		// TODO
	});

	describe.skip('fix command', () => {
		// TODO
	});

	describe.skip('infer command', () => {
		// TODO
	});

});
