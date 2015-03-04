import common = require('../test-common');
import _line = require('../line');
import EndOfLineRule = require('./end_of_line');
var rule = new EndOfLineRule();

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;

// ReSharper disable WrongExpressionStatement
describe('end_of_line rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe('check command', () => {

		it('validates "lf" setting', () => {
			rule.check(context, { end_of_line: 'lf' }, new Line('foo\r'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: cr');
		});

		it('validates "crlf" setting', () => {
			rule.check(context, { end_of_line: 'crlf' }, new Line('foo\n'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: lf');
		});

		it('validates "cr" setting', () => {
			rule.check(context, { end_of_line: 'cr' }, new Line('foo\r\n'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: crlf');
		});

		it('validates "ls" setting', () => {
			rule.check(context, { end_of_line: 'ls' }, new Line('foo\u2029'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: ps');
		});

		it('validates "ps" setting', () => {
			rule.check(context, { end_of_line: 'ps' }, new Line('foo\n'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: lf');
		});
	});

	describe('fix command', () => {

		it('replaces newline character with "lf" when "lf" is the setting', () => {
			var line = rule.fix({ end_of_line: 'lf' }, new Line('foo\r\n'));
			expect(line.Raw).to.equal('foo\n');
		});

		it('does nothing when there is no setting', () => {
			var line = rule.fix({}, new Line('foo\r\n'));
			expect(line.Raw).to.equal('foo\r\n');
		});

	});

	describe('infer command', () => {

		it('infers "lf" setting', () => {
			var inferred = rule.infer(new Line('foo\n'));
			expect(inferred).to.equal('lf');
		});

		it('infers "crlf" setting', () => {
			var inferred = rule.infer(new Line('foo\r\n'));
			expect(inferred).to.equal('crlf');
		});

		it('infers "cr" setting', () => {
			var inferred = rule.infer(new Line('foo\r'));
			expect(inferred).to.equal('cr');
		});

		it('infers "ls" setting', () => {
			var inferred = rule.infer(new Line('foo\u2028'));
			expect(inferred).to.equal('ls');
		});

		it('infers "ps" setting', () => {
			var inferred = rule.infer(new Line('foo\u2029'));
			expect(inferred).to.equal('ps');
		});

		it('infers nothing when no newline characters exist', () => {
			var inferred = rule.infer(new Line('foobarbaz'));
			expect(inferred).to.be.undefined;
		});
	});

});
