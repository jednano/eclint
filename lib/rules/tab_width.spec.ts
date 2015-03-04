import common = require('../test-common');
import _line = require('../line');
import TabWidthRule = require('./tab_width');
var rule = new TabWidthRule();

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;

// ReSharper disable WrongExpressionStatement
describe('tab_width rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe('check command', () => {
		it('remains silent', () => {
			rule.check(context, { tab_width: 4 }, new Line('\tfoo'));
			expect(reporter).not.to.have.been.called;
		});
	});

	describe('fix command', () => {
		it('returns the line back w/o modification', () => {
			var line = rule.fix(
				{
					tab_width: 2
				},
				new Line('\t\tfoo')
			);
			expect(line.Raw).to.eq('\t\tfoo');
		});
	});

	describe('infer command', () => {
		it('infers nothing',() => {
			var tabWidth = rule.infer(new Line('\t\tfoo'));
			expect(tabWidth).to.be.undefined;
		});
	});

});
