import linez = require('linez');
import common = require('../test-common');
import rule = require('./insert_final_newline');

var createLine = common.createLine;
var Doc = linez.Document;

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;

// ReSharper disable WrongExpressionStatement
describe('insert_final_newline rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe('check command',() => {

		it('reports expected final newline character', () => {
			rule.check(context, { insert_final_newline: true }, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar', { ending: '\n' })
			]));
			expect(reporter).not.to.have.been.called;
			rule.check(context, { insert_final_newline: true }, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar')
			]));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('expected final newline');
		});

		it('reports unexpected final newline character', () => {
			rule.check(context, { insert_final_newline: false }, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar')
			]));
			expect(reporter).not.to.have.been.called;
			rule.check(context, { insert_final_newline: false }, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar', { ending: '\n' })
			]));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('unexpected final newline');
		});

		it('remains silent when setting is undefined', () => {
			rule.check(context, {}, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar')
			]));
			rule.check(context, {}, new Doc([
				createLine('foo', { ending: '\n' }),
				createLine('bar', { ending: '\n' })
			]));
			expect(reporter).not.to.have.been.called;
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
