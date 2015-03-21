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

		it('remains silent when indentation is valid', () => {
			rule.check(context, { indent_style: 'tab' }, createLine('foo'));
			rule.check(context, { indent_style: 'tab' }, createLine('\t\tfoo'));
			rule.check(context, { indent_style: 'space' }, createLine('foo'));
			rule.check(context, { indent_style: 'space' }, createLine('    foo'));
			expect(reporter).not.to.have.been.called;
		});

		it('remains silent when indent_style is undefined', () => {
			rule.check(context, {}, createLine('foo'));
			rule.check(context, {}, createLine(' foo'));
			rule.check(context, {}, createLine('\tfoo'));
			expect(reporter).not.to.have.been.called;
		});

		it('reports a leading space when indent_style = tab', () => {
			rule.check(context, { indent_style: 'tab' }, createLine(' foo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('line 1: invalid indentation: found a leading space, expected: tab');
		});

		it('reports a leading tab when indent_style = space', () => {
			rule.check(context, { indent_style: 'space' }, createLine('\tfoo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('line 1: invalid indentation: found a leading tab, expected: space');
		});

		it('reports one invalid soft tab', () => {
			rule.check(context, { indent_style: 'tab', indent_size: 2 }, createLine('\t  \tfoo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('line 1: invalid indentation: found 1 soft tab');
		});

		it('reports multiple invalid soft tabs', () => {
			rule.check(context, { indent_style: 'tab', indent_size: 2 }, createLine('\t  \t  \tfoo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('line 1: invalid indentation: found 2 soft tabs');
		});

		it('reports one invalid hard tab', () => {
			rule.check(context, { indent_style: 'space', indent_size: 2 }, createLine('  \tfoo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('line 1: invalid indentation: found 1 hard tab');
		});

		it('reports multiple invalid hard tabs', () => {
			rule.check(context, { indent_style: 'space', indent_size: 2 }, createLine('  \t  \tfoo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('line 1: invalid indentation: found 2 hard tabs');
		});

		it('reports mixed tabs with spaces, regardless of settings', () => {
			rule.check(context, {}, createLine('  \tfoo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('line 1: invalid indentation: found mixed tabs with spaces');
		});

		it('remains silent when mixed tabs/spaces are found after indentation', () => {
			rule.check(context, {}, createLine('  foo \t \t bar'));
			expect(reporter).not.to.have.been.called;
		});

	});

	describe('fix command', () => {

		describe('indent_style = tab', () => {

			it('replaces leading 3-space soft tabs with hard tabs when indent_size = 3', () => {
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

			it('replaces leading 2-space soft tabs with hard tabs when tab_width = 2', () => {
				var line = rule.fix(
					{
						tab_width: 2,
						indent_style: 'tab'
					},
					createLine('    foo')
				);
				expect(line.text).to.eq('\t\tfoo');
			});

			it('fixes mixed hard tabs with soft tabs, preserving alignment', () => {
				var line = rule.fix(
					{
						tab_width: 2,
						indent_style: 'tab'
					},
					createLine('  \t   foo \t \t')
				);
				expect(line.text).to.eq('\t\t\t foo \t \t');
				line = rule.fix(
					{
						indent_style: 'space',
						indent_size: 2
					},
					createLine('  \t\t foo \t \t')
				);
				expect(line.text).to.eq('       foo \t \t');
			});

			it('preserves alignment, if any', () => {
				var line = rule.fix(
					{
						indent_style: 'tab',
						indent_size: 4
					},
					createLine('       foo')
				);
				expect(line.text).to.eq('\t   foo');
			});

			it('remains unchanged if inferred style is consistent with config setting', () => {
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

			it('preserves alignment, if any', () => {
				var line = rule.fix(
					{
						indent_style: 'space',
						indent_size: 4
					},
					createLine('\t\t      foo')
				);
				expect(line.text).to.eq('              foo');
			});

			it('remains unchanged if inferred style is consistent with config setting', () => {
				var line = rule.fix(
					{
						indent_style: 'space'
					},
					createLine('  foo')
				);
				expect(line.text).to.eq('  foo');
			});

			it('replaces hard tabs with tab_width-width soft tabs when indent_size = tab', () => {
				var line = rule.fix(
					{
						indent_style: 'space',
						indent_size: 'tab',
						tab_width: 3
					},
					createLine('\t\tfoo')
					);
				expect(line.text).to.eq('      foo');
			});

		});

	});

	describe('infer command', () => {

		it('infers space indent style', () => {
			var indentStyle = rule.infer(createLine('  foo'));
			expect(indentStyle).to.eq('space');
		});

		it('infers tab indent style', () => {
			var indentStyle = rule.infer(createLine('\tfoo'));
			expect(indentStyle).to.eq('tab');
		});

		it('returns undefined when no indentation is found', () => {
			var indentStyle = rule.infer(createLine('foo'));
			expect(indentStyle).to.be.undefined;
		});

	});

});
