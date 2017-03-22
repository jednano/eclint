import common = require('../test-common');
import rule = require('./trim_trailing_whitespace');
var createLine = common.createLine;

var expect = common.expect;

describe('trim_trailing_whitespace rule', () => {

	var settings = {
		true: { trim_trailing_whitespace: true },
		false: { trim_trailing_whitespace: false }
	};

	describe('check command', () => {

		describe('true setting', () => {

			it('reports trailing whitespace', () => {
				var error;
				error = rule.check(settings.true, createLine('foo '));
				expect(error).to.be.ok;
				expect(error.rule).to.equal('trim_trailing_whitespace');
				expect(error.message).to.be.equal('trailing whitespace found');
				expect(error.lineNumber).to.equal(1);
				expect(error.columnNumber).to.equal(4);
				error = rule.check(settings.true, createLine('foo\t '));
				expect(error).to.be.ok;
				expect(error.rule).to.equal('trim_trailing_whitespace');
				expect(error.message).to.be.equal('trailing whitespace found');
				expect(error.lineNumber).to.equal(1);
				expect(error.columnNumber).to.equal(4);
				error = rule.check(settings.true, createLine('\t \t'));
				expect(error).to.be.ok;
				expect(error.rule).to.equal('trim_trailing_whitespace');
				expect(error.message).to.be.equal('trailing whitespace found');
				expect(error.lineNumber).to.equal(1);
				expect(error.columnNumber).to.equal(1);
			});

			it('remains silent when no trailing whitespace is found', () => {
				var error;
				error = rule.check(settings.true, createLine('foo'));
				expect(error).to.be.undefined;
				error = rule.check(settings.true, createLine(''));
				expect(error).to.be.undefined;
			});
		});

		describe('false setting', () => {

			it('remains silent when trailing whitespace is found', () => {
				var error;
				error = rule.check(settings.false, createLine('foo '));
				expect(error).to.be.undefined;
				error = rule.check(settings.false, createLine('foo\t '));
				expect(error).to.be.undefined;
				error = rule.check(settings.false, createLine('\t \t'));
				expect(error).to.be.undefined;
			});

			it('remains silent when no trailing whitespace is found', () => {
				var error;
				error = rule.check(settings.false, createLine('foo'));
				expect(error).to.be.undefined;
				error = rule.check(settings.false, createLine(''));
				expect(error).to.be.undefined;
			});
		});
	});

	describe('fix command', () => {

		it('true setting replaces trailing whitespace with nothing', () => {
			var line = rule.fix(settings.true, createLine('foo '));
			expect(line.text).to.equal('foo');
			line = rule.fix(settings.true, createLine('foo\t '));
			expect(line.text).to.equal('foo');
			line = rule.fix(settings.true, createLine('\t \t'));
			expect(line.text).to.be.empty;
		});

		it('false setting leaves trailing whitespace alone', () => {
			var line = rule.fix(settings.false, createLine('foo '));
			expect(line.text).to.equal('foo ');
			line = rule.fix(settings.false, createLine('foo\t '));
			expect(line.text).to.equal('foo\t ');
			line = rule.fix(settings.false, createLine('\t \t'));
			expect(line.text).to.equal('\t \t');
		});

		it('no setting does not affect the line', () => {
			var line = rule.fix({}, createLine('foo '));
			expect(line.text).to.equal('foo ');
			line = rule.fix({}, createLine('foo\t '));
			expect(line.text).to.equal('foo\t ');
			line = rule.fix({}, createLine('\t \t'));
			expect(line.text).to.equal('\t \t');
		});
	});

	describe('infer command', () => {

		it('infers true when no trailing whitespace is found', () => {
			var setting = rule.infer(createLine('foo'));
			expect(setting).to.be.true;
			setting = rule.infer(createLine(''));
			expect(setting).to.be.true;
		});

		it('infers undefined when trailing whitespace is found', () => {
			var setting = rule.infer(createLine('foo '));
			expect(setting).to.be.undefined;
			setting = rule.infer(createLine('foo\t '));
			expect(setting).to.be.undefined;
			setting = rule.infer(createLine('\t \t'));
			expect(setting).to.be.undefined;
		});
	});
});
