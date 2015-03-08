import common = require('../test-common');
import _line = require('../line');
import MaxLineLengthRule = require('./max_line_length');
var rule = new MaxLineLengthRule();

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;

// ReSharper disable WrongExpressionStatement
describe('max_line_length rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe('check command', () => {

		it('validates max_line_length setting',() => {
			var fooLine = new Line('foo', { number: 1 });
			rule.check(context, { max_line_length: 3 }, fooLine);
			expect(reporter).not.to.have.been.called;
			rule.check(context, { max_line_length: 2 }, fooLine);
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly([
				'Line length ' + 3 + ' exceeds max_line_length',
				'setting of ' + 2,
				'on line number ' + 1
			].join(' '));
		});

	});

	describe('fix command',() => {

		it('throws an unsupported error', () => {
			var fn = () => {
				rule.fix({ max_line_length: 2 }, new Line());
			};
			expect(fn).to.throw('Fixing max_line_length setting unsupported');
		});

	});

	describe('infer command', () => {

		it('infers max line length', () => {
			var maxLineLength = rule.infer(new Line('foo'));
			expect(maxLineLength).to.eq(3);
		});

		it('ignores newline characters', () => {
			var maxLineLength = rule.infer(new Line('foo\n'));
			expect(maxLineLength).to.eq(3);
		});

	});

});
