import common = require('../test-common');
import _line = require('../line');
import TrimTrailingWhitespaceRule = require('./trim_trailing_whitespace');
var rule = new TrimTrailingWhitespaceRule();

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;

// ReSharper disable WrongExpressionStatement
describe('trim_trailing_whitespace rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	var settings = {};
	[true, false].forEach((setting) => {
		settings[setting.toString()] = { trim_trailing_whitespace: setting };
	});

	describe('check command', () => {

		describe('true setting', () => {

			it('reports trailing whitespace', () => {
				rule.check(context, settings['true'], new Line('foo '));
				rule.check(context, settings['true'], new Line('foo\t '));
				rule.check(context, settings['true'], new Line('\t \t'));
				expect(reporter).to.have.been.calledThrice;
				expect(reporter).to.always.have.been.calledWithExactly('Trailing whitespace found.');
			});

			it('remains silent when no trailing whitespace is found', () => {
				rule.check(context, settings['true'], new Line('foo'));
				rule.check(context, settings['true'], new Line(''));
				expect(reporter).to.not.have.been.called;
			});
		});

		describe('false setting', () => {

			it('remains silent when trailing whitespace is found', () => {
				rule.check(context, settings['false'], new Line('foo '));
				rule.check(context, settings['false'], new Line('foo\t '));
				rule.check(context, settings['false'], new Line('\t \t'));
				expect(reporter).to.not.have.been.called;
			});

			it('remains silent when no trailing whitespace is found', () => {
				rule.check(context, settings['false'], new Line('foo'));
				rule.check(context, settings['false'], new Line(''));
				expect(reporter).to.not.have.been.called;
			});
		});
	});

	describe('fix command', () => {

		it('true setting replaces trailing whitespace with nothing', () => {
			var line = rule.fix(settings['true'], new Line('foo '));
			expect(line.Text).to.equal('foo');
			line = rule.fix(settings['true'], new Line('foo\t '));
			expect(line.Text).to.equal('foo');
			line = rule.fix(settings['true'], new Line('\t \t'));
			expect(line.Text).to.be.undefined;
		});

		it('false setting leaves trailing whitespace alone', () => {
			var line = rule.fix(settings['false'], new Line('foo '));
			expect(line.Text).to.equal('foo ');
			line = rule.fix(settings['false'], new Line('foo\t '));
			expect(line.Text).to.equal('foo\t ');
			line = rule.fix(settings['false'], new Line('\t \t'));
			expect(line.Text).to.equal('\t \t');
		});

		it('no setting does not affect the line', () => {
			var line = rule.fix({}, new Line('foo '));
			expect(line.Text).to.equal('foo ');
			line = rule.fix({}, new Line('foo\t '));
			expect(line.Text).to.equal('foo\t ');
			line = rule.fix({}, new Line('\t \t'));
			expect(line.Text).to.equal('\t \t');
		});
	});

	describe('infer command', () => {

		it('infers "true" setting when no trailing whitespace is found', () => {
			var setting = rule.infer(new Line('foo'));
			expect(setting).to.be.true;
			setting = rule.infer(new Line(''));
			expect(setting).to.be.true;
		});

		it('infers "false" setting when trailing whitespace is found', () => {
			var setting = rule.infer(new Line('foo '));
			expect(setting).to.be.false;
			setting = rule.infer(new Line('foo\t '));
			expect(setting).to.be.false;
			setting = rule.infer(new Line('\t \t'));
			expect(setting).to.be.false;
		});
	});
});
