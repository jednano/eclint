var iconv = require('iconv-lite');

import common = require('../test-common');
import rule = require('./charset');
import linez = require('linez');

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var createLine = common.createLine;
var Doc = linez.Document;

iconv.extendNodeEncodings();

// ReSharper disable WrongExpressionStatement
describe('charset rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe('check command', () => {

		it('reports out of range characters for latin1 setting',() => {
			rule.check(context, { charset: 'latin1' }, linez('foo\u0080bar'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Character out of latin1 range: \u0080');
		});

		it('remains silent on in-range characters for latin1 setting', () => {
			rule.check(context, { charset: 'latin1' }, linez('foo\u007Fbar'));
			expect(reporter).to.not.have.been.called;
		});

		it('reports invalid charsets', () => {
			var doc = linez(new Buffer([0xef, 0xbb, 0xbf]));
			rule.check(context, { charset: 'utf-8' }, doc);
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Invalid charset: utf-8-bom');
		});

		it('validates utf-8-bom setting', () => {
			var doc = linez(new Buffer([0xef, 0xbb, 0xbf]));
			rule.check(context, { charset: 'utf-8-bom' }, doc);
			expect(reporter).to.not.have.been.called;
		});

		it('validates utf-16le setting', () => {
			var doc = linez(new Buffer([0xff, 0xfe]));
			rule.check(context, { charset: 'utf-16le' }, doc);
			expect(reporter).to.not.have.been.called;
		});

		it('validates utf-16be setting', () => {
			var doc = linez(new Buffer([0xfe, 0xff]));
			rule.check(context, { charset: 'utf-16be' }, doc);
			expect(reporter).to.not.have.been.called;
		});

		it.skip('validates utf-32le setting', () => {
			var doc = linez(new Buffer([0xff, 0xfe, 0x00, 0x00]));
			rule.check(context, { charset: 'utf-32le' }, doc);
			expect(reporter).to.not.have.been.called;
		});

		it.skip('validates utf-32be setting', () => {
			var doc = linez(new Buffer([0x00, 0x00, 0xfe, 0xff]));
			rule.check(context, { charset: 'utf-32be' }, doc);
			expect(reporter).to.not.have.been.called;
		});

		it('reports an expected/missing charset', () => {
			var doc = linez(new Buffer('foo', 'utf8'));
			rule.check(context, { charset: 'utf-8-bom' }, doc);
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Expected charset: utf-8-bom');
		});

		it('remains silent when an unsupported charset is set', () => {
			rule.check(context, { charset: 'foo' }, linez(''));
			expect(reporter).not.to.have.been.called;
		});

	});

	describe('fix command', () => {

		it('converts utf-8-bom to utf-16be when utf-16be is setting',() => {
			var doc = linez(Buffer.concat([
				new Buffer([0xef, 0xbb, 0xbf]),
				new Buffer('foo', 'utf8')
			]));
			expect(doc.charset).to.equal('utf-8-bom');
			doc = rule.fix({ charset: 'utf-16be' }, doc);
			expect(doc.charset).to.equal('utf-16be');
		});

	});

	describe('infer command', () => {

		it('infers utf-16be setting',() => {
			var doc = linez(new Buffer([0xfe, 0xff]));
			var inferred = rule.infer(doc);
			expect(inferred).to.equal('utf-16be');
		});

	});

});
