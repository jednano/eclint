import * as doc from '../doc';
import * as common from '../test-common';
import rule = require('./charset');
const expect = common.expect;
/* tslint:disable:no-unused-expression */

describe('charset rule', () => {

	describe('check command', () => {

		it('reports out of range characters for latin1 setting',() => {
			const errors = rule.check({ charset: 'latin1' }, doc.create('foo\u0080bar'));
			expect(errors).to.have.lengthOf(1);
			expect(errors[0].rule).to.equal('charset');
			expect(errors[0].message).to.equal('character out of latin1 range: "\u0080"');
			expect(errors[0].lineNumber).to.equal(1);
			expect(errors[0].columnNumber).to.equal(4);
		});

		it('remains silent on in-range characters for latin1 setting', () => {
			const errors = rule.check({ charset: 'latin1' }, doc.create('foo\u007Fbar'));
			expect(errors).to.have.lengthOf(0);
		});

		it('reports invalid charsets', () => {
			const document = doc.create(new Buffer([0xef, 0xbb, 0xbf]));
			const errors = rule.check({ charset: 'utf-8' }, document);
			expect(errors).to.have.lengthOf(1);
			expect(errors[0].rule).to.equal('charset');
			expect(errors[0].message).to.equal('invalid charset: utf-8-bom, expected: utf-8');
			expect(errors[0].lineNumber).to.equal(1);
			expect(errors[0].columnNumber).to.equal(1);
		});

		it('validates utf-8-bom setting', () => {
			const document = doc.create(new Buffer([0xef, 0xbb, 0xbf]));
			const errors = rule.check({ charset: 'utf-8-bom' }, document);
			expect(errors).to.have.lengthOf(0);
		});

		it('validates utf-16le setting', () => {
			const document = doc.create(new Buffer([0xff, 0xfe]));
			const errors = rule.check({ charset: 'utf-16le' }, document);
			expect(errors).to.have.lengthOf(0);
		});

		it('validates utf-16be setting', () => {
			const document = doc.create(new Buffer([0xfe, 0xff]));
			const errors = rule.check({ charset: 'utf-16be' }, document);
			expect(errors).to.have.lengthOf(0);
		});

		it.skip('validates utf-32le setting', () => {
			const document = doc.create(new Buffer([0xff, 0xfe, 0x00, 0x00]));
			const errors = rule.check({ charset: 'utf-32le' }, document);
			expect(errors).to.have.lengthOf(0);
		});

		it.skip('validates utf-32be setting', () => {
			const document = doc.create(new Buffer([0x00, 0x00, 0xfe, 0xff]));
			const errors = rule.check({ charset: 'utf-32be' }, document);
			expect(errors).to.have.lengthOf(0);
		});

		it('reports an expected/missing charset', () => {
			const document = doc.create(new Buffer('foo', 'utf8'));
			const errors = rule.check({ charset: 'utf-8-bom' }, document);
			expect(errors).to.have.lengthOf(1);
			expect(errors[0].rule).to.equal('charset');
			expect(errors[0].message).to.equal('expected charset: utf-8-bom');
			expect(errors[0].lineNumber).to.equal(1);
			expect(errors[0].columnNumber).to.equal(1);
		});

		it('remains silent when an unsupported charset is set', () => {
			const errors = rule.check({ charset: 'foo' }, doc.create(''));
			expect(errors).to.have.lengthOf(0);
		});

	});

	describe('fix command', () => {

		it('converts utf-8-bom to utf-16be when utf-16be is setting',() => {
			let document = doc.create(Buffer.concat([
				new Buffer([0xef, 0xbb, 0xbf]),
				new Buffer('foo', 'utf8'),
			]));
			expect(document.charset).to.equal('utf-8-bom');
			document = rule.fix({ charset: 'utf-16be' }, document);
			expect(document.charset).to.equal('utf-16be');
		});

	});

	describe('infer command', () => {

		it('infers utf-16be setting',() => {
			const document = doc.create(new Buffer([0xfe, 0xff]));
			const inferred = rule.infer(document);
			expect(inferred).to.equal('utf-16be');
		});

	});

});
