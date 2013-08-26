///<reference path='../../../vendor/dt-node/node.d.ts'/>
///<reference path='../../../vendor/dt-mocha/mocha.d.ts'/>
///<reference path='../../../vendor/dt-sinon-chai/sinon-chai.d.ts'/>
import common = require('../common');
import _line = require('../../../lib/line');
import rule = require('../../../lib/rules/end_of_line');


var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;
var Newlines = rule.Newlines;

describe('end_of_line rule', function() {

	beforeEach(function() {
		reporter.reset();
	});

	describe('check command', function() {

		it('validates "lf" setting', function() {
			rule.check(context, { end_of_line: Newlines.lf }, new Line('foo\r'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: cr');
		});

		it('validates "crlf" setting', function() {
			rule.check(context, { end_of_line: Newlines.crlf }, new Line('foo\n'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: lf');
		});

		it('validates "cr" setting', function() {
			rule.check(context, { end_of_line: Newlines.cr }, new Line('foo\r\n'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: crlf');
		});

		it('validates "ls" setting', function() {
			rule.check(context, { end_of_line: Newlines.ls }, new Line('foo\u2029'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: ps');
		});

		it('validates "ps" setting', function() {
			rule.check(context, { end_of_line: Newlines.ps }, new Line('foo\n'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: lf');
		});
	});

	describe('fix command', function() {

		it('replaces newline character with "lf" when "lf" is the setting', function() {
			var line = rule.fix({ end_of_line: Newlines.lf }, new Line('foo\r\n'));
			expect(line.Raw).to.equal('foo\n');
		});

		it('does nothing when there is no setting', function () {
			var line = rule.fix({}, new Line('foo\r\n'));
			expect(line.Raw).to.equal('foo\r\n');
		});

	});

	describe('infer command', function() {

		it('infers "lf" setting', function() {
			var inferred = rule.infer(new Line('foo\n'));
			expect(inferred).to.equal(Newlines.lf);
		});

		it('infers "crlf" setting', function() {
			var inferred = rule.infer(new Line('foo\r\n'));
			expect(inferred).to.equal(Newlines.crlf);
		});

		it('infers "cr" setting', function() {
			var inferred = rule.infer(new Line('foo\r'));
			expect(inferred).to.equal(Newlines.cr);
		});

		it('infers "ls" setting', function() {
			var inferred = rule.infer(new Line('foo\u2028'));
			expect(inferred).to.equal(Newlines.ls);
		});

		it('infers "ps" setting', function() {
			var inferred = rule.infer(new Line('foo\u2029'));
			expect(inferred).to.equal(Newlines.ps);
		});

		it('infers nothing when no newline characters exist', function() {
			var inferred = rule.infer(new Line('foobarbaz'));
			expect(inferred).to.be.undefined;
		});
	});

});
