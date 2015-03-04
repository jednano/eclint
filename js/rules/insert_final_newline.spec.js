var common = require('../test-common');
var _line = require('../line');
var InsertFinalNewlineRule = require('./insert_final_newline');
var rule = new InsertFinalNewlineRule();
var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;
// ReSharper disable WrongExpressionStatement
describe('insert_final_newline rule', function () {
    beforeEach(function () {
        reporter.reset();
    });
    describe('check command', function () {
        it('reports expected final newline character', function () {
            rule.check(context, { insert_final_newline: true }, [
                new Line('foo\n'),
                new Line('bar\n')
            ]);
            expect(reporter).not.to.have.been.called;
            rule.check(context, { insert_final_newline: true }, [
                new Line('foo\n'),
                new Line('bar')
            ]);
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Expected final newline character');
        });
        it('reports unexpected final newline character', function () {
            rule.check(context, { insert_final_newline: false }, [
                new Line('foo\n'),
                new Line('bar')
            ]);
            expect(reporter).not.to.have.been.called;
            rule.check(context, { insert_final_newline: false }, [
                new Line('foo\n'),
                new Line('bar\n')
            ]);
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Unexpected final newline character');
        });
        it('remains silent when setting is undefined', function () {
            rule.check(context, {}, [
                new Line('foo\n'),
                new Line('bar')
            ]);
            rule.check(context, {}, [
                new Line('foo\n'),
                new Line('bar\n')
            ]);
            expect(reporter).not.to.have.been.called;
        });
    });
    describe('fix command', function () {
        it('inserts a final newline when setting is true', function () {
            var lines = rule.fix({
                insert_final_newline: true
            }, [
                new Line('foo')
            ]);
            expect(lines[0].Newline.Name).to.eq('lf');
        });
        it('removes all final newlines when setting is false', function () {
            var lines = rule.fix({
                insert_final_newline: false
            }, [
                new Line('foo\n'),
                new Line('\n'),
                new Line('\n'),
                new Line('\n')
            ]);
            expect(lines.length).to.eq(1);
            expect(lines[0].Newline).to.be.undefined;
        });
        it('does nothing when setting is undefined', function () {
            [
                [
                    new Line('foo')
                ],
                [
                    new Line('foo\n'),
                    new Line('\n'),
                    new Line('\n'),
                    new Line('\n')
                ]
            ].forEach(function (inputLines) {
                var fixedLines = rule.fix({}, inputLines);
                expect(fixedLines).to.deep.equal(inputLines);
            });
        });
    });
    describe('infer command', function () {
        it('infers insert_final_newline = true', function () {
            var insertFinalNewline = rule.infer([
                new Line('foo\n'),
                new Line('bar\n')
            ]);
            expect(insertFinalNewline).to.be.true;
            insertFinalNewline = rule.infer([
                new Line('\n')
            ]);
            expect(insertFinalNewline).to.be.true;
        });
        it('infers insert_final_newline = false', function () {
            var insertFinalNewline = rule.infer([
                new Line('foo\n'),
                new Line('bar')
            ]);
            expect(insertFinalNewline).to.be.false;
            insertFinalNewline = rule.infer([]);
            expect(insertFinalNewline).to.be.false;
        });
    });
});
