import * as doc from '../doc';
import * as common from '../test-common';
import rule = require('./indent_style');
const expect = common.expect;
/* tslint:disable:no-unused-expression */

describe('indent_style rule', () => {

	describe('check command', () => {

		it('remains silent when indentation is valid', () => {
			let errors;
			errors = rule.check({ indent_style: 'tab' }, doc.create('foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_style: 'tab' }, doc.create('\t\tfoo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_style: 'space' }, doc.create('foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_style: 'space' }, doc.create('    foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_style: 'ignore' }, doc.create('\tfoo'));
			expect(errors).to.have.lengthOf(0);
		});

		it('remains silent when indent_style is undefined', () => {
			let errors;
			errors = rule.check({}, doc.create('foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({}, doc.create(' foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({}, doc.create('\tfoo'));
			expect(errors).to.have.lengthOf(0);
		});

		it('reports a leading space when indent_style = tab', () => {
			const error = rule.check({ indent_style: 'tab' }, doc.create(' foo'))[0];
			expect(error).to.be.ok;
			expect(error.rule).to.equal('indent_style');
			expect(error.message).to.be.equal('invalid indent style: space, expected: tab');
			expect(error.lineNumber).to.equal(1);
			expect(error.columnNumber).to.equal(1);
		});

		it('reports a leading tab when indent_style = space', () => {
			const error = rule.check({ indent_style: 'space' }, doc.create('\tfoo'))[0];
			expect(error).to.be.ok;
			expect(error.rule).to.equal('indent_style');
			expect(error.message).to.be.equal('invalid indent style: tab, expected: space');
			expect(error.lineNumber).to.equal(1);
			expect(error.columnNumber).to.equal(1);
		});

		it('reports one invalid soft tab', () => {
			const error = rule.check({ indent_style: 'tab', indent_size: 2 }, doc.create('\t  \tfoo'))[0];
			expect(error).to.be.ok;
			expect(error.rule).to.equal('indent_style');
			expect(error.message).to.be.equal('invalid indent style: space, expected: tab');
			expect(error.lineNumber).to.equal(1);
			expect(error.columnNumber).to.equal(2);
		});

		it('reports multiple invalid soft tabs', () => {
			const error = rule.check({ indent_style: 'tab', indent_size: 2 }, doc.create('\t  \t  \tfoo'))[0];
			expect(error).to.be.ok;
			expect(error.rule).to.equal('indent_style');
			expect(error.message).to.be.equal('invalid indent style: space, expected: tab');
			expect(error.lineNumber).to.equal(1);
			expect(error.columnNumber).to.equal(2);
		});

		it('reports one invalid hard tab', () => {
			const error = rule.check({ indent_style: 'space', indent_size: 2 }, doc.create('  \tfoo'))[0];
			expect(error).to.be.ok;
			expect(error.rule).to.equal('indent_style');
			expect(error.message).to.be.equal('invalid indent style: tab, expected: space');
			expect(error.lineNumber).to.equal(1);
			expect(error.columnNumber).to.equal(3);
		});

		it('reports multiple invalid hard tabs', () => {
			const error = rule.check({ indent_style: 'space', indent_size: 2 }, doc.create('  \t  \tfoo'))[0];
			expect(error).to.be.ok;
			expect(error.rule).to.equal('indent_style');
			expect(error.message).to.be.equal('invalid indent style: tab, expected: space');
			expect(error.lineNumber).to.equal(1);
			expect(error.columnNumber).to.equal(3);
		});

		it('reports mixed tabs with spaces, regardless of settings', () => {
			const error = rule.check({}, doc.create('  \tfoo'))[0];
			expect(error).to.be.ok;
			expect(error.rule).to.equal('indent_style');
			expect(error.message).to.be.equal('invalid indent style: mixed tabs with spaces');
			expect(error.lineNumber).to.equal(1);
			expect(error.columnNumber).to.equal(3);
		});

		it('remains silent when mixed tabs/spaces are found after indentation', () => {
			const errors = rule.check({}, doc.create('  foo \t \t bar'));
			expect(errors).to.have.lengthOf(0);
		});

		it('valid block commit', () => {
			const config = {
				block_comment_end: '*/',
				block_comment_start: '/*',
				indent_style: 'tab',
			};
			const errors = rule.check(config, doc.create([
				'\t/* block',
				'\t   comment */',
			].join('\n'), config));
			expect(errors).to.have.lengthOf(0);
		});

		it('valid document commit', () => {
			const config = {
				block_comment_end: '*/',
				block_comment_start: '/*',
				indent_style: 'tab',
			};
			const errors = rule.check(config, doc.create([
				'\t/*',
				'\t * comment',
				'\t */',
			].join('\n'), config));
			expect(errors).to.have.lengthOf(0);
		});
	});

	describe('fix command', () => {

		describe('indent_style = tab', () => {

			it('replaces leading 3-space soft tabs with hard tabs when indent_size = 3', () => {
				const document = rule.fix(
					{
						indent_size: 3, // priority
						indent_style: 'tab',
						tab_width: 2, // ignored
					},
					doc.create('      foo'),
				);
				expect(document.toString()).to.eq('\t\tfoo');
			});

			it('replaces leading 2-space soft tabs with hard tabs when tab_width = 2', () => {
				const document = rule.fix(
					{
						indent_style: 'tab',
						tab_width: 2,
					},
					doc.create('    foo'),
				);
				expect(document.toString()).to.eq('\t\tfoo');
			});

			it('replaces leading 2-space soft tabs with hard tabs when tab_width unset', () => {
				const document = rule.fix(
					{
						indent_style: 'tab',
					},
					doc.create([
						'foo',
						'  bar',
						'foo',
					].join('\n')),
				);
				expect(document.toString()).to.eq('foo\n\tbar\nfoo');
			});

			it('replaces leading 4-space soft tabs with hard tabs when tab_width unset', () => {
				const document = rule.fix(
					{
						indent_style: 'tab',
					},
					doc.create([
						'foo',
						'    bar',
						'foo',
					].join('\n')),
				);
				expect(document.toString()).to.eq('foo\n\tbar\nfoo');
			});

			it('fixes mixed hard tabs with soft tabs, preserving alignment', () => {
				let document = rule.fix(
					{
						indent_style: 'tab',
						tab_width: 2,
					},
					doc.create('  \t   foo \t \t'),
				);
				expect(document.toString()).to.eq('\t\t\tfoo \t \t');
				document = rule.fix(
					{
						indent_size: 2,
						indent_style: 'space',
					},
					doc.create('  \t\t foo \t \t'),
				);
				expect(document.toString()).to.eq('      foo \t \t');
			});

			it('preserves alignment, if any', () => {
				const document = rule.fix(
					{
						indent_size: 4,
						indent_style: 'tab',
					},
					doc.create('       foo'),
				);
				expect(document.toString()).to.eq('\t\tfoo');
			});

			it('remains unchanged if inferred style is consistent with config setting', () => {
				const document = rule.fix(
					{
						indent_style: 'tab',
					},
					doc.create('\tfoo'),
				);
				expect(document.toString()).to.eq('\tfoo');
			});

			it('block comments', () => {
				const config = {
					block_comment_end: '*/',
					block_comment_start: '/*',
					indent_style: 'tab',
				};
				const document = rule.fix(
					config,
					doc.create([
						'/* block',
						'comment */',
						'/*  block',
						'comment */',
						'/*',
						'block',
						'comment',
						'*/',
						'/*',
						'* document',
						'* comment',
						'*/',
					].join('\n'), config),
				);
				expect(document.toString()).to.eq([
					'/* block',
					'comment */',
					'/*  block',
					'comment */',
					'/*',
					'block',
					'comment',
					' */',
					'/*',
					' * document',
					' * comment',
					' */',
				].join('\n'));
			});

		});

		describe('indent_style = space',() => {

			it('replaces leading tab chars with 2-space indents when tab_width = 2', () => {
				const document = rule.fix(
					{
						indent_style: 'space',
						tab_width: 2,
					},
					doc.create('\t\tfoo'),
				);
				expect(document.toString()).to.eq('    foo');
			});

			it('replaces leading tab chars with 2-space indents when indent_size = 3', () => {
				const document = rule.fix(
					{
						indent_size: 3,
						indent_style: 'space',
					},
					doc.create('\t\tfoo'),
				);
				expect(document.toString()).to.eq('      foo');
			});

			it('preserves alignment, if any', () => {
				const document = rule.fix(
					{
						indent_size: 4,
						indent_style: 'space',
					},
					doc.create('\t\t      foo'),
				);
				expect(document.toString()).to.eq('            foo');
			});

			it('remains unchanged if inferred style is consistent with config setting', () => {
				const document = rule.fix(
					{
						indent_style: 'space',
					},
					doc.create('  foo'),
				);
				expect(document.toString()).to.eq('  foo');
			});

			it('replaces hard tabs with tab_width-width soft tabs when indent_size = tab', () => {
				const document = rule.fix(
					{
						indent_size: 'tab',
						indent_style: 'space',
						tab_width: 3,
					},
					doc.create('\t\tfoo'),
				);
				expect(document.toString()).to.eq('      foo');
			});

		});

	});

	describe('infer command', () => {

		it('infers space indent style', () => {
			const indentStyle = rule.infer(doc.create([
				'\tfoo',
				'\tbar',
				'  /*',
				'   *',
				'   */',
			].join('\n'), {
				block_comment: '*',
				block_comment_end: '*/',
				block_comment_start: '/*',
			}));
			expect(indentStyle).to.eq('space');
		});

		it('infers tab indent style', () => {
			const indentStyle = rule.infer(doc.create([
				'\tfoo',
				'/*',
				' *',
				' */',
			].join('\n'), {
				block_comment: '*',
				block_comment_end: '*/',
				block_comment_start: '/*',
			}));
			expect(indentStyle).to.eq('tab');
		});

		it('returns undefined when no indentation is found', () => {
			const indentStyle = rule.infer(doc.create('foo'));
			expect(indentStyle).to.be.undefined;
		});

	});

});
