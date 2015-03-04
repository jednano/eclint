var common = require('../test-common');
var _line = require('../line');
var TabWidthRule = require('./tab_width');
var rule = new TabWidthRule();
var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;
// ReSharper disable WrongExpressionStatement
describe('tab_width rule', function () {
    beforeEach(function () {
        reporter.reset();
    });
    describe('check command', function () {
        it('remains silent', function () {
            rule.check(context, { tab_width: 4 }, new Line('\tfoo'));
            expect(reporter).not.to.have.been.called;
        });
    });
    describe('fix command', function () {
        it('returns the line back w/o modification', function () {
            var line = rule.fix({
                tab_width: 2
            }, new Line('\t\tfoo'));
            expect(line.Raw).to.eq('\t\tfoo');
        });
    });
    describe('infer command', function () {
        it('infers nothing', function () {
            var tabWidth = rule.infer(new Line('\t\tfoo'));
            expect(tabWidth).to.be.undefined;
        });
    });
});
