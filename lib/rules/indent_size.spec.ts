import common = require('../test-common');
import _line = require('../line');
import IndentSizeRule = require('./indent_size');
import common2 = require('./common');
var IndentStyles = common2.IndentStyles;

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;
var rule = new IndentSizeRule();

// ReSharper disable WrongExpressionStatement
describe('indent_size rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe('check command', () => {

		it('reports invalid indent size', () => {
			rule.check(context, { indent_size: 4 }, new Line('  foo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Invalid indent size detected: 2');
		});

		it('remains silent when indent size is indeterminate', () => {
			rule.check(context, { indent_size: 4 }, new Line('foo'));
			expect(reporter).to.not.have.been.called;
		});

		it('remains silent when indent size is valid', () => {
			rule.check(context, { indent_size: 1 }, new Line(' foo'));
			rule.check(context, { indent_size: 1 }, new Line('  foo'));
			rule.check(context, { indent_size: 1 }, new Line('   foo'));
			rule.check(context, { indent_size: 1 }, new Line('    foo'));
			rule.check(context, { indent_size: 1 }, new Line('     foo'));
			rule.check(context, { indent_size: 1 }, new Line('      foo'));
			rule.check(context, { indent_size: 1 }, new Line('       foo'));
			rule.check(context, { indent_size: 1 }, new Line('        foo'));
			rule.check(context, { indent_size: 2 }, new Line('  foo'));
			rule.check(context, { indent_size: 2 }, new Line('    foo'));
			rule.check(context, { indent_size: 2 }, new Line('      foo'));
			rule.check(context, { indent_size: 2 }, new Line('        foo'));
			rule.check(context, { indent_size: 3 }, new Line('   foo'));
			rule.check(context, { indent_size: 3 }, new Line('      foo'));
			rule.check(context, { indent_size: 4 }, new Line('    foo'));
			rule.check(context, { indent_size: 4 }, new Line('        foo'));
			rule.check(context, { indent_size: 5 }, new Line('     foo'));
			rule.check(context, { indent_size: 6 }, new Line('      foo'));
			rule.check(context, { indent_size: 7 }, new Line('       foo'));
			rule.check(context, { indent_size: 8 }, new Line('        foo'));
			expect(reporter).to.not.have.been.called;
		});

	});

	describe('infer command', () => {

		it('infers tab setting', () => {
			expect(rule.infer(new Line('\tfoo'))).to.equal('tab');
			expect(rule.infer(new Line('\t\tfoo'))).to.equal('tab');
			expect(rule.infer(new Line('\t\t foo'))).to.equal('tab');
		});

		it('infers 1-space setting', () => {
			expect(rule.infer(new Line(' \tfoo'))).to.equal(1);
		});

		it('infers 2-space setting', () => {
			expect(rule.infer(new Line('  \tfoo'))).to.equal(2);
		});

		it('infers 3-space setting', () => {
			expect(rule.infer(new Line('   \tfoo'))).to.equal(3);
		});

		it('infers 4-space setting', () => {
			expect(rule.infer(new Line('    \tfoo'))).to.equal(4);
		});

		it('infers 5-space setting', () => {
			expect(rule.infer(new Line('     \tfoo'))).to.equal(5);
			expect(rule.infer(new Line('          \tfoo'))).to.equal(5);
		});

		it('infers 6-space setting', () => {
			expect(rule.infer(new Line('      \tfoo'))).to.equal(6);
			expect(rule.infer(new Line('            \tfoo'))).to.equal(6);
		});

		it('infers 7-space setting', () => {
			expect(rule.infer(new Line('       \tfoo'))).to.equal(7);
			expect(rule.infer(new Line('              \tfoo'))).to.equal(7);
		});

		it('infers 8-space setting', () => {
			expect(rule.infer(new Line('        \tfoo'))).to.equal(8);
			expect(rule.infer(new Line('                \tfoo'))).to.equal(8);
		});

		it('remains indeterminate when no indentation is detected', () => {
			expect(rule.infer(new Line('foo'))).to.be.undefined;
		});

	});

	describe('fix command', () => {

		it('replaces leading spaces with tabs', () => {
			var line = rule.fix({
				indent_style: IndentStyles.tab,
				indent_size: 'tab',
				tab_width: 4
			}, new Line('          foo'));
			expect(line.Text).to.equal('\t\t  foo');

			line = rule.fix({
				indent_style: IndentStyles.tab,
				indent_size: 4
			}, new Line('          foo'));
			expect(line.Text).to.equal('\t\t  foo');
		});

		it('replaces leading tabs with spaces', () => {
			var line = rule.fix({
				indent_style: IndentStyles.space,
				indent_size: 4
			}, new Line('\t\t  foo'));
			expect(line.Text).to.equal('          foo');
		});

	});

});
