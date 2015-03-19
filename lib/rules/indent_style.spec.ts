import common = require('../test-common');
import rule = require('./indent_style');
var createLine = common.createLine;

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;

// ReSharper disable WrongExpressionStatement
describe('indent_style rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe('check command', () => {

		it('validates tab setting', () => {
			rule.check(context, { indent_style: 'tab' }, createLine('foo'));
			rule.check(context, { indent_style: 'tab' }, createLine('\tfoo'));
			expect(reporter).not.to.have.been.called;
			rule.check(context, { indent_style: 'tab' }, createLine(' foo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('line 1: invalid indent style: space, expected: tab');
		});

		it('validates space setting', () => {
			rule.check(context, { indent_style: 'space' }, createLine('foo'));
			rule.check(context, { indent_style: 'space' }, createLine(' foo'));
			expect(reporter).not.to.have.been.called;
			rule.check(context, { indent_style: 'space' }, createLine('\tfoo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('line 1: invalid indent style: tab, expected: space');
		});

		it('remains silent when indent_style is undefined', () => {
			rule.check(context, {}, createLine('foo', { ending: '\n' }));
			rule.check(context, {}, createLine(' foo', { ending: '\n' }));
			rule.check(context, {}, createLine('\tfoo', { ending: '\n' }));
			expect(reporter).not.to.have.been.called;
		});

	});

	describe('fix command', () => {

		describe('indent_style = tab', () => {

			it('replaces leading 3-space indents with tab chars when indent_size = 3', () => {
				var line = rule.fix(
					{
						indent_size: 3, // priority
						tab_width: 2, // ignored
						indent_style: 'tab'
					},
					createLine('      foo')
				);
				expect(line.text).to.eq('\t\tfoo');
			});

			it('replaces leading 2-space indents with tab chars when tab_width = 2', () => {
				var line = rule.fix(
					{
						tab_width: 2,
						indent_style: 'tab'
					},
					createLine('    foo')
				);
				expect(line.text).to.eq('\t\tfoo');
			});

			it('replaces leading 4-space indents with tab chars by default', () => {
				var line = rule.fix(
					{
						indent_style: 'tab'
					},
					createLine('        foo')
				);
				expect(line.text).to.eq('\t\tfoo');
			});

			it('preserves alignment, if any', () => {
				var line = rule.fix(
					{
						indent_style: 'tab'
					},
					createLine('       foo')
				);
				expect(line.text).to.eq('\t   foo');
			});

			it('does nothing if inferred size is consistent with setting', () => {
				var line = rule.fix(
					{
						indent_style: 'tab'
					},
					createLine('\tfoo')
				);
				expect(line.text).to.eq('\tfoo');
			});

		});

		describe('indent_style = space',() => {

			it('replaces leading tab chars with 2-space indents when tab_width = 2', () => {
				var line = rule.fix(
					{
						tab_width: 2,
						indent_style: 'space'
					},
					createLine('\t\tfoo')
				);
				expect(line.text).to.eq('    foo');
			});

			it('replaces leading tab chars with 2-space indents when indent_size = 3', () => {
				var line = rule.fix(
					{
						indent_size: 3,
						indent_style: 'space'
					},
					createLine('\t\tfoo')
				);
				expect(line.text).to.eq('      foo');
			});

			it('replaces leading tab chars with 4-space indents by default', () => {
				var line = rule.fix(
					{
						indent_style: 'space'
					},
					createLine('\t\tfoo')
				);
				expect(line.text).to.eq('        foo');
			});

			it('preserves alignment, if any', () => {
				var line = rule.fix(
					{
						indent_style: 'space'
					},
					createLine('\t\t      foo')
				);
				expect(line.text).to.eq('              foo');
			});

			it('does nothing if inferred size is consistent with setting', () => {
				var line = rule.fix(
					{
						indent_style: 'space'
					},
					createLine('  foo')
				);
				expect(line.text).to.eq('  foo');
			});

		});

		describe('indent_size = tab', () => {

			it('replaces tabs with tab_width', () => {
				var line = rule.fix(
					{
						indent_size: 'tab',
						tab_width: 3
					},
					createLine('\t\tfoo')
				);
				expect(line.text).to.eq('      foo');
			});

			it('replaces tabs with 4 spaces if no tab_width is specified', () => {
				var line = rule.fix(
					{
						indent_size: 'tab'
					},
					createLine('\t\tfoo')
				);
				expect(line.text).to.eq('        foo');
			});

		});

	});

	describe('infer command', () => {

		it('infers space indent style', () => {
			var indentStyle = rule.infer(createLine('  foo', { ending: '\n' }));
			expect(indentStyle).to.eq('space');
		});

		it('infers tab indent style', () => {
			var indentStyle = rule.infer(createLine('\tfoo', { ending: '\n' }));
			expect(indentStyle).to.eq('tab');
		});

		it('returns undefined when no indentation is found', () => {
			var indentStyle = rule.infer(createLine('foo', { ending: '\n' }));
			expect(indentStyle).to.be.undefined;
		});

	});

});
