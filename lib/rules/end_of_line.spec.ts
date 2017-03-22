import common = require('../test-common');
import rule = require('./end_of_line');

var expect = common.expect;
var createLine = common.createLine;

describe('end_of_line rule', () => {

	describe('check command', () => {

		it('validates "lf" setting', () => {
			var error = rule.check({ end_of_line: 'lf' }, createLine('foo', { ending: '\r' }));
			expect(error).to.be.ok;
			expect(error.rule).to.equal('end_of_line');
			expect(error.message).to.equal('invalid newline: cr, expected: lf');
			expect(error.lineNumber).to.equal(1);
			expect(error.columnNumber).to.equal(4);
		});

		it('validates "crlf" setting', () => {
			var error = rule.check({ end_of_line: 'crlf' }, createLine('foo', { ending: '\n' }));
			expect(error).to.be.ok;
			expect(error.rule).to.equal('end_of_line');
			expect(error.message).to.equal('invalid newline: lf, expected: crlf');
			expect(error.lineNumber).to.equal(1);
			expect(error.columnNumber).to.equal(4);
		});

		it('validates "cr" setting', () => {
			var error = rule.check({ end_of_line: 'cr' }, createLine('foo', { ending: '\r\n' }));
			expect(error).to.be.ok;
			expect(error.rule).to.equal('end_of_line');
			expect(error.message).to.equal('invalid newline: crlf, expected: cr');
			expect(error.lineNumber).to.equal(1);
			expect(error.columnNumber).to.equal(4);
		});

		it('remains silent when the correct end_of_line setting is specified', () => {
			var error = rule.check({ end_of_line: 'lf' }, createLine('foo', { ending: '\n' }));
			expect(error).to.be.undefined;
		});

		it('remains silent when no end_of_line setting is specified', () => {
			var error;
			error = rule.check({}, createLine('', { ending: '\n' }));
			expect(error).to.be.undefined;
			error = rule.check({}, createLine('', { ending: '\r\n' }));
			expect(error).to.be.undefined;
		});

		it('remains silent when no newline is detected', () => {
			var error = rule.check({ end_of_line: 'lf' }, createLine(''));
			expect(error).to.be.undefined;
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
