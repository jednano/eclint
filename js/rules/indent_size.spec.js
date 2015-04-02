var _ = require('lodash');
var common = require('../test-common');
var linez = require('linez');
var rule = require('./indent_size');
var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var createLine = common.createLine;
var Doc = linez.Document;
// ReSharper disable WrongExpressionStatement
describe('indent_size rule', function () {
    beforeEach(function () {
        reporter.reset();
    });
    describe('check command', function () {
        it('reports invalid indent size: 2, expected: 4', function () {
            rule.check(context, { indent_size: 4 }, new Doc([
                createLine('  foo')
            ]));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('line 1: invalid indent size: 2, expected: 4');
        });
        it('reports invalid indent size: 3, expected: 2', function () {
            rule.check(context, { indent_size: 2 }, new Doc([
                createLine('   foo')
            ]));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('line 1: invalid indent size: 3, expected: 2');
        });
        it('remains silent when indent size is an unsupported string', function () {
            rule.check(context, { indent_size: 'foo' }, new Doc([
                createLine('')
            ]));
            expect(reporter).not.to.have.been.called;
        });
        it('remains silent when inferred indent size is tab', function () {
            rule.check(context, { indent_size: 4 }, new Doc([
                createLine('\tfoo')
            ]));
            expect(reporter).not.to.have.been.called;
        });
        it('remains silent when the indent style setting is tab', function () {
            rule.check(context, { indent_size: 4, indent_style: 'tab' }, new Doc([
                createLine('  foo')
            ]));
            expect(reporter).not.to.have.been.called;
        });
        it('remains silent when indent size is indeterminate', function () {
            rule.check(context, { indent_size: 4 }, new Doc([
                createLine('foo')
            ]));
            expect(reporter).to.not.have.been.called;
        });
        it('remains silent when indent size is valid', function () {
            rule.check(context, { indent_size: 0 }, new Doc([
                createLine('foo')
            ]));
            rule.check(context, { indent_size: 1 }, new Doc([
                createLine(' foo')
            ]));
            rule.check(context, { indent_size: 1 }, new Doc([
                createLine('  foo')
            ]));
            rule.check(context, { indent_size: 1 }, new Doc([
                createLine('   foo')
            ]));
            rule.check(context, { indent_size: 1 }, new Doc([
                createLine('    foo')
            ]));
            rule.check(context, { indent_size: 1 }, new Doc([
                createLine('     foo')
            ]));
            rule.check(context, { indent_size: 1 }, new Doc([
                createLine('      foo')
            ]));
            rule.check(context, { indent_size: 1 }, new Doc([
                createLine('       foo')
            ]));
            rule.check(context, { indent_size: 1 }, new Doc([
                createLine('        foo')
            ]));
            rule.check(context, { indent_size: 2 }, new Doc([
                createLine('  foo')
            ]));
            rule.check(context, { indent_size: 2 }, new Doc([
                createLine('    foo')
            ]));
            rule.check(context, { indent_size: 2 }, new Doc([
                createLine('      foo')
            ]));
            rule.check(context, { indent_size: 2 }, new Doc([
                createLine('        foo')
            ]));
            rule.check(context, { indent_size: 2 }, new Doc([
                createLine('          foo')
            ]));
            rule.check(context, { indent_size: 3 }, new Doc([
                createLine('   foo')
            ]));
            rule.check(context, { indent_size: 3 }, new Doc([
                createLine('      foo')
            ]));
            rule.check(context, { indent_size: 4 }, new Doc([
                createLine('    foo')
            ]));
            rule.check(context, { indent_size: 4 }, new Doc([
                createLine('        foo')
            ]));
            rule.check(context, { indent_size: 5 }, new Doc([
                createLine('     foo')
            ]));
            rule.check(context, { indent_size: 6 }, new Doc([
                createLine('      foo')
            ]));
            rule.check(context, { indent_size: 7 }, new Doc([
                createLine('       foo')
            ]));
            rule.check(context, { indent_size: 8 }, new Doc([
                createLine('        foo')
            ]));
            expect(reporter).to.not.have.been.called;
        });
    });
    describe('fix command', function () {
        it('returns the line as-is', function () {
            var doc = new Doc([
                createLine('  \t foo')
            ]);
            var fixedLine = rule.fix({
                indent_style: 'space',
                indent_size: 4
            }, doc);
            expect(fixedLine).to.deep.equal(doc);
        });
    });
    describe('infer command', function () {
        _.range(0, 9).forEach(function (n) {
            it('infers ' + n + '-space setting', function () {
                expect(rule.infer(new Doc([
                    createLine(_.repeat(' ', n) + 'foo')
                ]))).to.eq(n);
            });
        });
        it('infers leading spaces w/o any tabs that follow', function () {
            expect(rule.infer(new Doc([
                createLine('  \t\tfoo')
            ]))).to.eq(2);
        });
    });
});
