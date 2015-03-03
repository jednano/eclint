import common = require('../test-common');
import _line = require('../line');
import rule = require('./insert_final_newline');

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;

// ReSharper disable WrongExpressionStatement
describe('insert_final_newline rule', () => {

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
