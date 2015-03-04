var common = require('../test-common');
var _line = require('../line');
var EndOfLineRule = require('./end_of_line');
var rule = new EndOfLineRule();
var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;
// ReSharper disable WrongExpressionStatement
describe('end_of_line rule', function () {
    beforeEach(function () {
        reporter.reset();
    });
    describe('check command', function () {
        it('validates "lf" setting', function () {
            rule.check(context, { end_of_line: 'lf' }, new Line('foo\r'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: cr');
        });
        it('validates "crlf" setting', function () {
            rule.check(context, { end_of_line: 'crlf' }, new Line('foo\n'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: lf');
        });
        it('validates "cr" setting', function () {
            rule.check(context, { end_of_line: 'cr' }, new Line('foo\r\n'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: crlf');
        });
        it('validates "ls" setting', function () {
            rule.check(context, { end_of_line: 'ls' }, new Line('foo\u2029'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: ps');
        });
        it('validates "ps" setting', function () {
            rule.check(context, { end_of_line: 'ps' }, new Line('foo\n'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: lf');
        });
    });
    describe('fix command', function () {
        it('replaces newline character with "lf" when "lf" is the setting', function () {
            var line = rule.fix({ end_of_line: 'lf' }, new Line('foo\r\n'));
            expect(line.Raw).to.equal('foo\n');
        });
        it('does nothing when there is no setting', function () {
            var line = rule.fix({}, new Line('foo\r\n'));
            expect(line.Raw).to.equal('foo\r\n');
        });
    });
    describe('infer command', function () {
        it('infers "lf" setting', function () {
            var inferred = rule.infer(new Line('foo\n'));
            expect(inferred).to.equal('lf');
        });
        it('infers "crlf" setting', function () {
            var inferred = rule.infer(new Line('foo\r\n'));
            expect(inferred).to.equal('crlf');
        });
        it('infers "cr" setting', function () {
            var inferred = rule.infer(new Line('foo\r'));
            expect(inferred).to.equal('cr');
        });
        it('infers "ls" setting', function () {
            var inferred = rule.infer(new Line('foo\u2028'));
            expect(inferred).to.equal('ls');
        });
        it('infers "ps" setting', function () {
            var inferred = rule.infer(new Line('foo\u2029'));
            expect(inferred).to.equal('ps');
        });
        it('infers nothing when no newline characters exist', function () {
            var inferred = rule.infer(new Line('foobarbaz'));
            expect(inferred).to.be.undefined;
        });
    });
});
