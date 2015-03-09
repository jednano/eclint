var testCommon = require('../test-common');
var _line = require('../line');
var IndentStyleRule = require('./indent_style');
var rule = new IndentStyleRule();
var expect = testCommon.expect;
var reporter = testCommon.reporter;
var context = testCommon.context;
var Line = _line.Line;
// ReSharper disable WrongExpressionStatement
describe('indent_style rule', function () {
    beforeEach(function () {
        reporter.reset();
    });
    describe('check command', function () {
        it('validates tab setting', function () {
            rule.check(context, { indent_style: 'tab' }, new Line('foo\n'));
            rule.check(context, { indent_style: 'tab' }, new Line('\tfoo\n'));
            expect(reporter).not.to.have.been.called;
            rule.check(context, { indent_style: 'tab' }, new Line(' foo\n'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Invalid indent style: space');
        });
        it('validates space setting', function () {
            rule.check(context, { indent_style: 'space' }, new Line('foo\n'));
            rule.check(context, { indent_style: 'space' }, new Line(' foo\n'));
            expect(reporter).not.to.have.been.called;
            rule.check(context, { indent_style: 'space' }, new Line('\tfoo\n'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Invalid indent style: tab');
        });
        it('remains silent when indent_style is undefined', function () {
            rule.check(context, {}, new Line('foo\n'));
            rule.check(context, {}, new Line(' foo\n'));
            rule.check(context, {}, new Line('\tfoo\n'));
            expect(reporter).not.to.have.been.called;
        });
    });
    describe('fix command', function () {
        describe('indent_style = tab', function () {
            it('replaces leading 3-space indents with tab chars when indent_size = 3', function () {
                var line = rule.fix({
                    indent_size: 3,
                    tab_width: 2,
                    indent_style: 'tab'
                }, new Line('      foo'));
                expect(line.Raw).to.eq('\t\tfoo');
            });
            it('replaces leading 2-space indents with tab chars when tab_width = 2', function () {
                var line = rule.fix({
                    tab_width: 2,
                    indent_style: 'tab'
                }, new Line('    foo'));
                expect(line.Raw).to.eq('\t\tfoo');
            });
            it('replaces leading 4-space indents with tab chars by default', function () {
                var line = rule.fix({
                    indent_style: 'tab'
                }, new Line('        foo'));
                expect(line.Raw).to.eq('\t\tfoo');
            });
            it('preserves alignment, if any', function () {
                var line = rule.fix({
                    indent_style: 'tab'
                }, new Line('       foo'));
                expect(line.Raw).to.eq('\t   foo');
            });
            it('does nothing if inferred size is consistent with setting', function () {
                var line = rule.fix({
                    indent_style: 'tab'
                }, new Line('\tfoo'));
                expect(line.Raw).to.eq('\tfoo');
            });
        });
        describe('indent_style = space', function () {
            it('replaces leading tab chars with 2-space indents when tab_width = 2', function () {
                var line = rule.fix({
                    tab_width: 2,
                    indent_style: 'space'
                }, new Line('\t\tfoo'));
                expect(line.Raw).to.eq('    foo');
            });
            it('replaces leading tab chars with 2-space indents when indent_size = 3', function () {
                var line = rule.fix({
                    indent_size: 3,
                    indent_style: 'space'
                }, new Line('\t\tfoo'));
                expect(line.Raw).to.eq('      foo');
            });
            it('replaces leading tab chars with 4-space indents by default', function () {
                var line = rule.fix({
                    indent_style: 'space'
                }, new Line('\t\tfoo'));
                expect(line.Raw).to.eq('        foo');
            });
            it('preserves alignment, if any', function () {
                var line = rule.fix({
                    indent_style: 'space'
                }, new Line('\t\t      foo'));
                expect(line.Raw).to.eq('              foo');
            });
            it('does nothing if inferred size is consistent with setting', function () {
                var line = rule.fix({
                    indent_style: 'space'
                }, new Line('  foo'));
                expect(line.Raw).to.eq('  foo');
            });
        });
        describe('indent_size = tab', function () {
            it('replaces tabs with tab_width', function () {
                var line = rule.fix({
                    indent_size: 'tab',
                    tab_width: 3
                }, new Line('\t\tfoo'));
                expect(line.Raw).to.eq('      foo');
            });
            it('replaces tabs with 4 spaces if no tab_width is specified', function () {
                var line = rule.fix({
                    indent_size: 'tab'
                }, new Line('\t\tfoo'));
                expect(line.Raw).to.eq('        foo');
            });
        });
    });
    describe('infer command', function () {
        it('infers space indent style', function () {
            var indentStyle = rule.infer(new Line('  foo\n'));
            expect(indentStyle).to.eq('space');
        });
        it('infers tab indent style', function () {
            var indentStyle = rule.infer(new Line('\tfoo\n'));
            expect(indentStyle).to.eq('tab');
        });
        it('returns undefined when no indentation is found', function () {
            var indentStyle = rule.infer(new Line('foo\n'));
            expect(indentStyle).to.be.undefined;
        });
    });
});
