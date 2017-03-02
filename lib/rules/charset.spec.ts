import common = require('../test-common');
import rule = require('./charset');
import linez from 'linez';

var expect = common.expect;

// ReSharper disable WrongExpressionStatement
describe('charset rule', () => {

	describe('check command', () => {

		it('reports out of range characters for latin1 setting',() => {
			var errors = rule.check({ charset: 'latin1' }, linez('foo\u0080bar'));
			expect(errors).to.have.lengthOf(1);
			expect(errors[0].rule).to.equal('charset');
			expect(errors[0].message).to.equal('character out of latin1 range: "\u0080"');
			expect(errors[0].lineNumber).to.equal(1);
			expect(errors[0].columnNumber).to.equal(4);
		});

		it('remains silent on in-range characters for latin1 setting', () => {
			var errors = rule.check({ charset: 'latin1' }, linez('foo\u007Fbar'));
			expect(errors).to.have.lengthOf(0);
		});

		it('reports invalid charsets', () => {
			var doc = linez(new Buffer([0xef, 0xbb, 0xbf]));
			var errors = rule.check({ charset: 'utf-8' }, doc);
			expect(errors).to.have.lengthOf(1);
			expect(errors[0].rule).to.equal('charset');
			expect(errors[0].message).to.equal('invalid charset: utf-8-bom, expected: utf-8');
			expect(errors[0].lineNumber).to.equal(1);
			expect(errors[0].columnNumber).to.equal(1);
		});

		it('validates utf-8-bom setting', () => {
			var doc = linez(new Buffer([0xef, 0xbb, 0xbf]));
			var errors = rule.check({ charset: 'utf-8-bom' }, doc);
			expect(errors).to.have.lengthOf(0);
		});

		it('validates utf-16le setting', () => {
			var doc = linez(new Buffer([0xff, 0xfe]));
			var errors = rule.check({ charset: 'utf-16le' }, doc);
			expect(errors).to.have.lengthOf(0);
		});

		it('validates utf-16be setting', () => {
			var doc = linez(new Buffer([0xfe, 0xff]));
			var errors = rule.check({ charset: 'utf-16be' }, doc);
			expect(errors).to.have.lengthOf(0);
		});

		it.skip('validates utf-32le setting', () => {
			var doc = linez(new Buffer([0xff, 0xfe, 0x00, 0x00]));
			var errors = rule.check({ charset: 'utf-32le' }, doc);
			expect(errors).to.have.lengthOf(0);
		});

		it.skip('validates utf-32be setting', () => {
			var doc = linez(new Buffer([0x00, 0x00, 0xfe, 0xff]));
			var errors = rule.check({ charset: 'utf-32be' }, doc);
			expect(errors).to.have.lengthOf(0);
		});

		it('reports an expected/missing charset', () => {
			var doc = linez(new Buffer('foo', 'utf8'));
			var errors = rule.check({ charset: 'utf-8-bom' }, doc);
			expect(errors).to.have.lengthOf(1);
			expect(errors[0].rule).to.equal('charset');
			expect(errors[0].message).to.equal('expected charset: utf-8-bom');
			expect(errors[0].lineNumber).to.equal(1);
			expect(errors[0].columnNumber).to.equal(1);
		});

		it('remains silent when an unsupported charset is set', () => {
			var errors = rule.check({ charset: 'foo' }, linez(''));
			expect(errors).to.have.lengthOf(0);
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
