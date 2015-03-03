var common = require('../common');
var _line = require('../../../lib/line');
var IndentSizeRule = require('../../../lib/rules/indent_size');
var common2 = require('../../../lib/rules/common');
var IndentStyles = common2.IndentStyles;
var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;
var rule = new IndentSizeRule();
// ReSharper disable WrongExpressionStatement
describe('indent_size rule', function () {
    beforeEach(function () {
        reporter.reset();
    });
    describe('check command', function () {
        it('reports invalid indent size', function () {
            rule.check(context, { indent_size: 4 }, new Line('  foo'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Invalid indent size detected: 2');
        });
        it('remains silent when indent size is indeterminate', function () {
            rule.check(context, { indent_size: 4 }, new Line('foo'));
            expect(reporter).to.not.have.been.called;
        });
        it('remains silent when indent size is valid', function () {
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
    describe('infer command', function () {
        it('infers tab setting', function () {
            expect(rule.infer(new Line('\tfoo'))).to.equal('tab');
            expect(rule.infer(new Line('\t\tfoo'))).to.equal('tab');
            expect(rule.infer(new Line('\t\t foo'))).to.equal('tab');
        });
        it('infers 1-space setting', function () {
            expect(rule.infer(new Line(' \tfoo'))).to.equal(1);
        });
        it('infers 2-space setting', function () {
            expect(rule.infer(new Line('  \tfoo'))).to.equal(2);
        });
        it('infers 3-space setting', function () {
            expect(rule.infer(new Line('   \tfoo'))).to.equal(3);
        });
        it('infers 4-space setting', function () {
            expect(rule.infer(new Line('    \tfoo'))).to.equal(4);
        });
        it('infers 5-space setting', function () {
            expect(rule.infer(new Line('     \tfoo'))).to.equal(5);
            expect(rule.infer(new Line('          \tfoo'))).to.equal(5);
        });
        it('infers 6-space setting', function () {
            expect(rule.infer(new Line('      \tfoo'))).to.equal(6);
            expect(rule.infer(new Line('            \tfoo'))).to.equal(6);
        });
        it('infers 7-space setting', function () {
            expect(rule.infer(new Line('       \tfoo'))).to.equal(7);
            expect(rule.infer(new Line('              \tfoo'))).to.equal(7);
        });
        it('infers 8-space setting', function () {
            expect(rule.infer(new Line('        \tfoo'))).to.equal(8);
            expect(rule.infer(new Line('                \tfoo'))).to.equal(8);
        });
        it('remains indeterminate when no indentation is detected', function () {
            expect(rule.infer(new Line('foo'))).to.be.undefined;
        });
    });
    describe('fix command', function () {
        it('replaces leading spaces with tabs', function () {
            var line = rule.fix({
                indent_style: 1 /* tab */,
                indent_size: 'tab',
                tab_width: 4
            }, new Line('          foo'));
            expect(line.Text).to.equal('\t\t  foo');
            line = rule.fix({
                indent_style: 1 /* tab */,
                indent_size: 4
            }, new Line('          foo'));
            expect(line.Text).to.equal('\t\t  foo');
        });
        it('replaces leading tabs with spaces', function () {
            var line = rule.fix({
                indent_style: 0 /* space */,
                indent_size: 4
            }, new Line('\t\t  foo'));
            expect(line.Text).to.equal('          foo');
        });
    });
});
