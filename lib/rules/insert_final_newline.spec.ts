import common = require('../test-common');
import _line = require('../line');
import InsertFinalNewlineRule = require('./insert_final_newline');
var rule = new InsertFinalNewlineRule();

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;

// ReSharper disable WrongExpressionStatement
describe('insert_final_newline rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe('check command',() => {

		it('reports expected final newline character', () => {
			rule.check(context, { insert_final_newline: true }, [
				new Line('foo\n'),
				new Line('bar\n')
			]);
			expect(reporter).not.to.have.been.called;
			rule.check(context, { insert_final_newline: true }, [
				new Line('foo\n'),
				new Line('bar')
			]);
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Expected final newline character');
		});

		it('reports unexpected final newline character', () => {
			rule.check(context, { insert_final_newline: false }, [
				new Line('foo\n'),
				new Line('bar')
			]);
			expect(reporter).not.to.have.been.called;
			rule.check(context, { insert_final_newline: false }, [
				new Line('foo\n'),
				new Line('bar\n')
			]);
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Unexpected final newline character');
		});

		it('remains silent when setting is undefined', () => {
			rule.check(context, {}, [
				new Line('foo\n'),
				new Line('bar')
			]);
			rule.check(context, {}, [
				new Line('foo\n'),
				new Line('bar\n')
			]);
			expect(reporter).not.to.have.been.called;
		});

	});

	describe('fix command', () => {

		it('inserts a final newline when setting is true', () => {
			var lines = rule.fix(
				{
					insert_final_newline: true
				},
				[
					new Line('foo')
				]
			);
			expect(lines[0].Newline.Name).to.eq('lf');
		});

		it('removes all final newlines when setting is false', () => {
			var lines = rule.fix(
				{
					insert_final_newline: false
				},
				[
					new Line('foo\n'),
					new Line('\n'),
					new Line('\n'),
					new Line('\n')
				]
			);
			expect(lines.length).to.eq(1);
			expect(lines[0].Newline).to.be.undefined;
		});

		it('does nothing when setting is undefined', () => {
			[
				[
					new Line('foo')
				],
				[
					new Line('foo\n'),
					new Line('\n'),
					new Line('\n'),
					new Line('\n')
				]
			].forEach(inputLines => {
				var fixedLines = rule.fix({}, inputLines);
				expect(fixedLines).to.deep.equal(inputLines);
			});
		});

		it('does nothing when line already exists',() => {
			var lines = [
				new Line('foo\n')
			];
			var fixedLines = rule.fix({ insert_final_newline: true }, lines);
			expect(fixedLines).to.deep.equal(lines);
		});

		it('adds a line to an empty file', () => {
			var fixedLines = rule.fix({
				insert_final_newline: true,
				end_of_line: 'lf'
			}, []);
			expect(fixedLines).to.deep.equal([ new Line('\n', { number: 1 }) ]);
		});

	});

	describe('infer command',() => {

		it('infers insert_final_newline = true',() => {
			var insertFinalNewline = rule.infer([
				new Line('foo\n'),
				new Line('bar\n')
			]);
			expect(insertFinalNewline).to.be.true;
			insertFinalNewline = rule.infer([
				new Line('\n')
			]);
			expect(insertFinalNewline).to.be.true;
		});

		it('infers insert_final_newline = false',() => {
			var insertFinalNewline = rule.infer([
				new Line('foo\n'),
				new Line('bar')
			]);
			expect(insertFinalNewline).to.be.false;
			insertFinalNewline = rule.infer([]);
			expect(insertFinalNewline).to.be.false;
		});

	});

});
