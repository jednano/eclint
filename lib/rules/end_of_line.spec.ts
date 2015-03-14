import common = require('../test-common');
import EndOfLineRule = require('./end_of_line');
var rule = new EndOfLineRule();

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var createLine = common.createLine;

// ReSharper disable WrongExpressionStatement
describe('end_of_line rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe('check command', () => {

		it('validates "lf" setting', () => {
			rule.check(context, { end_of_line: 'lf' }, createLine('foo', { ending: '\r' }));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: cr');
		});

		it('validates "crlf" setting', () => {
			rule.check(context, { end_of_line: 'crlf' }, createLine('foo', { ending: '\n' }));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: lf');
		});

		it('validates "cr" setting', () => {
			rule.check(context, { end_of_line: 'cr' }, createLine('foo', { ending: '\r\n' }));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: crlf');
		});

	});

	describe('fix command', () => {

		it('replaces newline character with "lf" when "lf" is the setting', () => {
			var line = rule.fix({ end_of_line: 'lf' }, createLine('foo', { ending: '\r\n' }));
			expect(line.text).to.eq('foo');
			expect(line.ending).to.eq('\n');
		});

		it('does nothing when there is no setting', () => {
			var line = rule.fix({}, createLine('foo', { ending: '\r\n' }));
			expect(line.text).to.eq('foo');
			expect(line.ending).to.eq('\r\n');
		});

	});

	describe('infer command', () => {

		it('infers "lf" setting', () => {
			var inferred = rule.infer(createLine('foo', { ending: '\n' }));
			expect(inferred).to.equal('lf');
		});

		it('infers "crlf" setting', () => {
			var inferred = rule.infer(createLine('foo', { ending: '\r\n' }));
			expect(inferred).to.equal('crlf');
		});

		it('infers "cr" setting', () => {
			var inferred = rule.infer(createLine('foo', { ending: '\r' }));
			expect(inferred).to.equal('cr');
		});

		it('infers nothing when no newline characters exist', () => {
			var inferred = rule.infer(createLine('foobarbaz'));
			expect(inferred).to.be.undefined;
		});
	});

});
