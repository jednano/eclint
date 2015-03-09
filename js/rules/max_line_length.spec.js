var common = require('../test-common');
var _line = require('../line');
var MaxLineLengthRule = require('./max_line_length');
var rule = new MaxLineLengthRule();
var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;
// ReSharper disable WrongExpressionStatement
describe('max_line_length rule', function () {
    beforeEach(function () {
        reporter.reset();
    });
    describe('check command', function () {
        it('validates max_line_length setting', function () {
            var fooLine = new Line('foo', { number: 1 });
            rule.check(context, { max_line_length: 3 }, fooLine);
            expect(reporter).not.to.have.been.called;
            rule.check(context, { max_line_length: 2 }, fooLine);
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly([
                'Line length ' + 3 + ' exceeds max_line_length',
                'setting of ' + 2,
                'on line number ' + 1
            ].join(' '));
        });
    });
    describe('fix command', function () {
        it('throws an unsupported error', function () {
            var fn = function () {
                rule.fix({ max_line_length: 2 }, new Line());
            };
            expect(fn).to.throw('Fixing max_line_length setting unsupported');
        });
    });
    describe('infer command', function () {
        it('infers max line length', function () {
            var maxLineLength = rule.infer(new Line('foo'));
            expect(maxLineLength).to.eq(3);
        });
        it('ignores newline characters', function () {
            var maxLineLength = rule.infer(new Line('foo\n'));
            expect(maxLineLength).to.eq(3);
        });
    });
});