import common = require('../test-common');
import rule = require('./insert_final_newline');
import * as doc from '../doc';

var = common;

var expect = common.expect;

describe('insert_final_newline rule', () => {

	describe('check command',() => {

		it('reports expected final newline character', () => {
			var errors;
			errors = rule.check({ insert_final_newline: true }, doc.create([
				'foo',
				'bar'
				''
			].join('\n')));
			expect(errors).to.be.have.lengthOf(0);
			errors = rule.check({ insert_final_newline: true }, doc.create([
				'foo',
				'bar'
			].join('\n')));
			expect(errors).to.be.have.lengthOf(1);
			expect(errors[0].rule).to.equal('insert_final_newline');
			expect(errors[0].message).to.be.equal('expected final newline');
			expect(errors[0].lineNumber).to.equal(2);
			expect(errors[0].columnNumber).to.equal(3);
		});

		it('reports unexpected final newline character', () => {
			var errors;
			errors = rule.check({ insert_final_newline: false }, doc.create([
				'foo',
				'bar'
			].join('\n')));
			expect(errors).to.be.have.lengthOf(0);
			errors = rule.check({ insert_final_newline: false }, doc.create([
				'foo',
				'bar',
				''
			].join('\n')));
			expect(errors).to.be.have.lengthOf(1);
			expect(errors[0].rule).to.equal('insert_final_newline');
			expect(errors[0].message).to.be.equal('unexpected final newline');
			expect(errors[0].lineNumber).to.equal(2);
			expect(errors[0].columnNumber).to.equal(4);
		});

		it('remains silent when setting is undefined', () => {
			var errors;
			errors = rule.check({}, doc.create([
				'foo',
				'bar'
			].join('\n')));
			expect(errors).to.be.have.lengthOf(0);
			errors = rule.check({}, doc.create([
				'foo',
				'bar',
				''
			].join('\n')));
			expect(errors).to.be.have.lengthOf(0);
		});

	});

	describe('fix command', () => {

		it('inserts a final newline when setting is true', () => {
			var document = rule.fix(
				{
					insert_final_newline: true
				},
				doc.create('foo')
			);
			expect(document.lines[0].ending).to.eq('\n');
		});

		it('removes all final newlines when setting is false', () => {
			var document = rule.fix(
				{
					insert_final_newline: false
				},
				doc.create([
					'foo',
					'',
					'',
					'',
					'',
				].join('\n'))
			);
			expect(document.lines.length).to.eq(1);
			expect(document.lines[0].ending).to.be.empty;
		});

		it('does nothing when setting is undefined', () => {
			[
				doc.create('foo'),
				doc.create([
					'foo',
					'',
					'',
					'',
					'',
				].join('\n'))
			].forEach(document => {
				var fixedDoc = rule.fix({}, document);
				expect(fixedDoc).to.deep.equal(document);
			});
		});

		it('does nothing when line already exists',() => {
			var lines = [
				'foo',
				''
			].join('\n');
			var fixedDoc = rule.fix({ insert_final_newline: true }, doc.create(lines));
			expect(fixedDoc.toString()).to.deep.equal(lines);
		});

		it('adds a line to an empty file', () => {
			var fixedDoc = rule.fix({
				insert_final_newline: true,
				end_of_line: 'lf'
			}, doc.create(''));
			expect(fixedDoc.toString()).to.deep.equal('\n');
		});

	});

	describe('infer command',() => {

		it('infers insert_final_newline = true',() => {
			var insertFinalNewline = rule.infer(doc.create([
				'foo',
				'bar',
				'',
			].join('\n')));
			expect(insertFinalNewline).to.be.true;
			insertFinalNewline = rule.infer(doc.create('\n'));
			expect(insertFinalNewline).to.be.true;
		});

		it('infers insert_final_newline = false',() => {
			var insertFinalNewline = rule.infer(doc.create([
				'foo',
				'bar',
			].join('\n')));
			expect(insertFinalNewline).to.be.false;
			insertFinalNewline = rule.infer(doc.create(''));
			expect(insertFinalNewline).to.be.false;
		});

	});

});
