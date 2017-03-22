import * as linez from 'linez';
import common = require('../test-common');
import rule = require('./insert_final_newline');

var createLine = common.createLine;
var Doc = linez.Document;

var expect = common.expect;

describe('insert_final_newline rule', () => {

	describe('check command',() => {

		it('reports expected final newline character', () => {
			var errors;
			errors = rule.check({ insert_final_newline: true }, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar', { ending: '\n' })
			]));
			expect(errors).to.be.have.lengthOf(0);
			errors = rule.check({ insert_final_newline: true }, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar')
			]));
			expect(errors).to.be.have.lengthOf(1);
			expect(errors[0].rule).to.equal('insert_final_newline');
			expect(errors[0].message).to.be.equal('expected final newline');
			expect(errors[0].lineNumber).to.equal(2);
			expect(errors[0].columnNumber).to.equal(3);
		});

		it('reports unexpected final newline character', () => {
			var errors;
			errors = rule.check({ insert_final_newline: false }, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar')
			]));
			expect(errors).to.be.have.lengthOf(0);
			errors = rule.check({ insert_final_newline: false }, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar', { ending: '\n' })
			]));
			expect(errors).to.be.have.lengthOf(1);
			expect(errors[0].rule).to.equal('insert_final_newline');
			expect(errors[0].message).to.be.equal('unexpected final newline');
			expect(errors[0].lineNumber).to.equal(2);
			expect(errors[0].columnNumber).to.equal(4);
		});

		it('remains silent when setting is undefined', () => {
			var errors;
			errors = rule.check({}, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar')
			]));
			expect(errors).to.be.have.lengthOf(0);
			errors = rule.check({}, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar', { ending: '\n' })
			]));
			expect(errors).to.be.have.lengthOf(0);
		});

	});

	describe('fix command', () => {

		it('inserts a final newline when setting is true', () => {
			var doc = rule.fix(
				{
					insert_final_newline: true
				},
				new Doc([
					createLine('foo')
				])
			);
			expect(doc.lines[0].ending).to.eq('\n');
		});

		it('removes all final newlines when setting is false', () => {
			var doc = rule.fix(
				{
					insert_final_newline: false
				},
				new Doc([
					createLine('foo', { ending: '\n' }),
					createLine('', { ending: '\n' }),
					createLine('', { ending: '\n' }),
					createLine('', { ending: '\n' })
				])
			);
			expect(doc.lines.length).to.eq(1);
			expect(doc.lines[0].ending).to.be.empty;
		});

		it('does nothing when setting is undefined', () => {
			[
				new Doc([
					createLine('foo')
				]),
				new Doc([
					createLine('foo', { ending: '\n' }),
					createLine('', { ending: '\n' }),
					createLine('', { ending: '\n' }),
					createLine('', { ending: '\n' })
				])
			].forEach(doc => {
				var fixedDoc = rule.fix({}, doc);
				expect(fixedDoc).to.deep.equal(doc);
			});
		});

		it('does nothing when line already exists',() => {
			var lines = [
				createLine('foo', { ending: '\n' })
			];
			var fixedDoc = rule.fix({ insert_final_newline: true }, new Doc(lines));
			expect(fixedDoc.lines).to.deep.equal(lines);
		});

		it('adds a line to an empty file', () => {
			var fixedDoc = rule.fix({
				insert_final_newline: true,
				end_of_line: 'lf'
			}, new Doc());
			expect(fixedDoc.lines).to.deep.equal([
				createLine('', { number: 1, ending: '\n' })
			]);
		});

	});

	describe('infer command',() => {

		it('infers insert_final_newline = true',() => {
			var insertFinalNewline = rule.infer(new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar', { ending: '\n' })
			]));
			expect(insertFinalNewline).to.be.true;
			insertFinalNewline = rule.infer(new Doc([
				createLine('', { ending: '\n' })
			]));
			expect(insertFinalNewline).to.be.true;
		});

		it('infers insert_final_newline = false',() => {
			var insertFinalNewline = rule.infer(new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar')
			]));
			expect(insertFinalNewline).to.be.false;
			insertFinalNewline = rule.infer(new Doc());
			expect(insertFinalNewline).to.be.false;
		});

	});

});
