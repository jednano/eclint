import _ = require('lodash');
import common = require('../test-common');
import rule = require('./indent_size');

var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var createLine = common.createLine;

// ReSharper disable WrongExpressionStatement
describe('indent_size rule', () => {

	beforeEach(() => {
		reporter.reset();
	});

	describe('check command',() => {

		it('reports invalid indent size: 2 with setting of 4', () => {
			rule.check(context, { indent_size: 4 }, createLine('  foo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Invalid indent size detected: 2');
		});

		it('reports invalid indent size: 2 with setting of tab', () => {
			rule.check(context, { indent_size: 'tab' }, createLine('  foo'));
			expect(reporter).to.have.been.calledOnce;
			expect(reporter).to.have.been.calledWithExactly('Invalid indent size detected: 2');
		});

		it('remains silent when indent size is an unsupported string', () => {
			rule.check(context, { indent_size: 'foo' }, createLine(''));
			expect(reporter).not.to.have.been.called;
		});

		it('remains silent when inferred indent size is tab', () => {
			rule.check(context, { indent_size: 4 }, createLine('\tfoo'));
			expect(reporter).not.to.have.been.called;
		});

		it('remains silent when the indent style setting is tab', () => {
			rule.check(context, { indent_size: 4, indent_style: 'tab' }, createLine('  foo'));
			expect(reporter).not.to.have.been.called;
		});

		it('remains silent when indent size is indeterminate', () => {
			rule.check(context, { indent_size: 4 }, createLine('foo'));
			expect(reporter).to.not.have.been.called;
		});

		it('remains silent when indent size is valid', () => {
			rule.check(context, { indent_size: 1 }, createLine(' foo'));
			rule.check(context, { indent_size: 1 }, createLine('  foo'));
			rule.check(context, { indent_size: 1 }, createLine('   foo'));
			rule.check(context, { indent_size: 1 }, createLine('    foo'));
			rule.check(context, { indent_size: 1 }, createLine('     foo'));
			rule.check(context, { indent_size: 1 }, createLine('      foo'));
			rule.check(context, { indent_size: 1 }, createLine('       foo'));
			rule.check(context, { indent_size: 1 }, createLine('        foo'));
			rule.check(context, { indent_size: 2 }, createLine('  foo'));
			rule.check(context, { indent_size: 2 }, createLine('    foo'));
			rule.check(context, { indent_size: 2 }, createLine('      foo'));
			rule.check(context, { indent_size: 2 }, createLine('        foo'));
			rule.check(context, { indent_size: 3 }, createLine('   foo'));
			rule.check(context, { indent_size: 3 }, createLine('      foo'));
			rule.check(context, { indent_size: 4 }, createLine('    foo'));
			rule.check(context, { indent_size: 4 }, createLine('        foo'));
			rule.check(context, { indent_size: 5 }, createLine('     foo'));
			rule.check(context, { indent_size: 6 }, createLine('      foo'));
			rule.check(context, { indent_size: 7 }, createLine('       foo'));
			rule.check(context, { indent_size: 8 }, createLine('        foo'));
			expect(reporter).to.not.have.been.called;
		});

	});

	describe('infer command', () => {

		it('infers tab setting', () => {
			expect(rule.infer(createLine('\tfoo'))).to.equal('tab');
			expect(rule.infer(createLine('\t\tfoo'))).to.equal('tab');
			expect(rule.infer(createLine('\t\t foo'))).to.equal('tab');
		});

		_.range(0, 9).forEach(n => {
			it('infers ' + n + '-space setting', () => {
				expect(rule.infer(createLine(_.repeat(' ', n) + 'foo'))).to.eq(n);
			});
		});

		it('infers only leading spaces when tabs follow', () => {
			expect(rule.infer(createLine('  \tfoo'))).to.eq(2);
		});

	});

	describe('fix command', () => {

		it('replaces leading spaces with tabs', () => {
			var line = rule.fix({
				indent_style: 'tab',
				indent_size: 'tab',
				tab_width: 4
			}, createLine('          foo'));
			expect(line.text).to.equal('\t\t  foo');

			line = rule.fix({
				indent_style: 'tab',
				indent_size: 4
			}, createLine('          foo'));
			expect(line.text).to.equal('\t\t  foo');
		});

		it('replaces leading tabs with spaces', () => {
			var line = rule.fix({
				indent_style: 'space',
				indent_size: 4
			}, createLine('\t\t  foo'));
			expect(line.text).to.equal('          foo');
		});

		it('does nothing when no indent style is defined', () => {
			var line = rule.fix({}, createLine('\t foo'));
			expect(line.text).to.eq('\t foo');
		});

		it('does nothing when indent style setting is foo', () => {
			var line = rule.fix({
				indent_style: 'foo',
				indent_size: 4
			}, createLine('\t foo'));
			expect(line.text).to.eq('\t foo');
		});

	});

});
