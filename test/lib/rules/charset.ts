import common = require('../common');
import _line = require('../../../lib/line');
import CharsetRule = require('../../../lib/rules/charset');

var rule = new CharsetRule();
var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;
var Charsets = _line.Charsets;

// ReSharper disable WrongExpressionStatement
describe('charset rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe('check command', () => {

		it('reports out of range characters for "latin1" setting', () => {
			rule.check(context, { charset: Charsets.latin1 }, new Line('foo\u0080bar'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Character out of latin1 range: \u0080');
		});

		it('remains silent on in-range characters for "latin1" setting', () => {
			rule.check(context, { charset: Charsets.latin1 }, new Line('foo\u007Fbar'));
			expect(reporter).to.not.have.been.called;
		});

		it('reports invalid charsets', () => {
			var line = new Line('\u00EF\u00BB\u00BFfoo', {number: 1});
			rule.check(context, { charset: Charsets.utf_8 }, line);
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Invalid charset: utf-8-bom');
		});

		it('validates "utf-8-bom" setting', () => {
			var line = new Line('\u00EF\u00BB\u00BFfoo', {number: 1});
			rule.check(context, { charset: Charsets.utf_8_bom }, line);
			expect(reporter).to.not.have.been.called;
		});

		it('validates "utf-16be" setting', () => {
			var line = new Line('\u00FE\u00FFfoo', {number: 1});
			rule.check(context, { charset: Charsets.utf_16be }, line);
			expect(reporter).to.not.have.been.called;
		});

		it('validates "utf-16le" setting', () => {
			var line = new Line('\u00FF\u00FEfoo', {number: 1});
			rule.check(context, { charset: Charsets.utf_16le }, line);
			expect(reporter).to.not.have.been.called;
		});

		it('validates "utf-32le" setting', () => {
			var line = new Line('\u00FF\u00FE\u0000\u0000foo', {number: 1});
			rule.check(context, { charset: Charsets.utf_32le }, line);
			expect(reporter).to.not.have.been.called;
		});

		it('validates "utf-32be" setting', () => {
			var line = new Line('\u0000\u0000\u00FE\u00FFfoo', {number: 1});
			rule.check(context, { charset: Charsets.utf_32be }, line);
			expect(reporter).to.not.have.been.called;
		});

	});

	describe('fix command', () => {

		it('converts utf-8-bom to utf-32le when "utf-32le" is setting', () => {
			var line = new Line('\u00EF\u00BB\u00BFfoo', {number: 1});
			expect(line.Charsets).to.equal(Charsets.utf_8_bom);
			line = rule.fix({ charset: Charsets.utf_32le }, line);
			expect(line.Charsets).to.equal(Charsets.utf_32le);
		});

	});

	describe('infer command', () => {

		it('infers "utf-16be" setting', () => {
			var line = new Line('\u00FE\u00FFfoo', {number: 1});
			var inferred = rule.infer(line);
			expect(inferred).to.equal(Charsets.utf_16be);
		});

	});

});
