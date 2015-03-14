var common = require('../test-common');
var TrimTrailingWhitespaceRule = require('./trim_trailing_whitespace');
var rule = new TrimTrailingWhitespaceRule();
var createLine = common.createLine;
var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
// ReSharper disable WrongExpressionStatement
describe('trim_trailing_whitespace rule', function () {
    beforeEach(function () {
        reporter.reset();
    });
    var settings = {};
    [true, false].forEach(function (setting) {
        settings[setting.toString()] = { trim_trailing_whitespace: setting };
    });
    describe('check command', function () {
        describe('true setting', function () {
            it('reports trailing whitespace', function () {
                rule.check(context, settings['true'], createLine('foo '));
                rule.check(context, settings['true'], createLine('foo\t '));
                rule.check(context, settings['true'], createLine('\t \t'));
                expect(reporter).to.have.been.calledThrice;
                expect(reporter).to.always.have.been.calledWithExactly('Trailing whitespace found.');
            });
            it('remains silent when no trailing whitespace is found', function () {
                rule.check(context, settings['true'], createLine('foo'));
                rule.check(context, settings['true'], createLine(''));
                expect(reporter).to.not.have.been.called;
            });
        });
        describe('false setting', function () {
            it('remains silent when trailing whitespace is found', function () {
                rule.check(context, settings['false'], createLine('foo '));
                rule.check(context, settings['false'], createLine('foo\t '));
                rule.check(context, settings['false'], createLine('\t \t'));
                expect(reporter).to.not.have.been.called;
            });
            it('remains silent when no trailing whitespace is found', function () {
                rule.check(context, settings['false'], createLine('foo'));
                rule.check(context, settings['false'], createLine(''));
                expect(reporter).to.not.have.been.called;
            });
        });
    });
    describe('fix command', function () {
        it('true setting replaces trailing whitespace with nothing', function () {
            var line = rule.fix(settings['true'], createLine('foo '));
            expect(line.text).to.equal('foo');
            line = rule.fix(settings['true'], createLine('foo\t '));
            expect(line.text).to.equal('foo');
            line = rule.fix(settings['true'], createLine('\t \t'));
            expect(line.text).to.be.empty;
        });
        it('false setting leaves trailing whitespace alone', function () {
            var line = rule.fix(settings['false'], createLine('foo '));
            expect(line.text).to.equal('foo ');
            line = rule.fix(settings['false'], createLine('foo\t '));
            expect(line.text).to.equal('foo\t ');
            line = rule.fix(settings['false'], createLine('\t \t'));
            expect(line.text).to.equal('\t \t');
        });
        it('no setting does not affect the line', function () {
            var line = rule.fix({}, createLine('foo '));
            expect(line.text).to.equal('foo ');
            line = rule.fix({}, createLine('foo\t '));
            expect(line.text).to.equal('foo\t ');
            line = rule.fix({}, createLine('\t \t'));
            expect(line.text).to.equal('\t \t');
        });
    });
    describe('infer command', function () {
        it('infers "true" setting when no trailing whitespace is found', function () {
            var setting = rule.infer(createLine('foo'));
            expect(setting).to.be.true;
            setting = rule.infer(createLine(''));
            expect(setting).to.be.true;
        });
        it('infers "false" setting when trailing whitespace is found', function () {
            var setting = rule.infer(createLine('foo '));
            expect(setting).to.be.false;
            setting = rule.infer(createLine('foo\t '));
            expect(setting).to.be.false;
            setting = rule.infer(createLine('\t \t'));
            expect(setting).to.be.false;
        });
    });
});
