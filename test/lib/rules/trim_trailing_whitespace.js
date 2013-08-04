var Line = require('../../../lib/Line');
var rule = require('../../../lib/rules/trim_trailing_whitespace');


describe('trim_trailing_whitespace rule', function() {

    beforeEach(function() {
        reporter.reset();
    });

    var settings = {};
    [true, false].forEach(function(setting) {
        settings[setting] = { trim_trailing_whitespace: setting };
    });

    describe('check command', function() {

        describe('true setting', function() {

            it('reports trailing whitespace', function() {
                rule.check(context, settings.true, new Line('foo '));
                rule.check(context, settings.true, new Line('foo\t '));
                rule.check(context, settings.true, new Line('\t \t'));
                expect(reporter).to.have.been.calledThrice;
                expect(reporter).to.always.have.been.calledWithExactly('Trailing whitespace found.');
            });

            it('remains silent when no trailing whitespace is found', function() {
                rule.check(context, settings.true, new Line('foo'));
                rule.check(context, settings.true, new Line(''));
                expect(reporter).to.not.have.been.called;
            });

        });

        describe('false setting', function() {

            it('remains silent when trailing whitespace is found', function() {
                rule.check(context, settings.false, new Line('foo '));
                rule.check(context, settings.false, new Line('foo\t '));
                rule.check(context, settings.false, new Line('\t \t'));
                expect(reporter).to.not.have.been.called;
            });

            it('remains silent when no trailing whitespace is found', function() {
                rule.check(context, settings.false, new Line('foo'));
                rule.check(context, settings.false, new Line(''));
                expect(reporter).to.not.have.been.called;
            });

        });

    });

    describe('fix command', function() {

        it('true setting replaces trailing whitespace with nothing', function() {
            var line;
            line = rule.fix(settings.true, new Line('foo '));
            expect(line.text).to.equal('foo');
            line = rule.fix(settings.true, new Line('foo\t '));
            expect(line.text).to.equal('foo');
            line = rule.fix(settings.true, new Line('\t \t'));
            expect(line.text).to.equal('');
        });

        it('false setting leaves trailing whitespace alone', function() {
            var line;
            line = rule.fix(settings.false, new Line('foo '));
            expect(line.text).to.equal('foo ');
            line = rule.fix(settings.false, new Line('foo\t '));
            expect(line.text).to.equal('foo\t ');
            line = rule.fix(settings.false, new Line('\t \t'));
            expect(line.text).to.equal('\t \t');
        });

        it('no setting does not affect the line', function() {
            var line;
            line = rule.fix({}, new Line('foo '));
            expect(line.text).to.equal('foo ');
            line = rule.fix({}, new Line('foo\t '));
            expect(line.text).to.equal('foo\t ');
            line = rule.fix({}, new Line('\t \t'));
            expect(line.text).to.equal('\t \t');
        });

    });

    describe('infer command', function() {

        it('infers "true" setting when no trailing whitespace is found', function() {
            var setting;
            setting = rule.infer(new Line('foo'));
            expect(setting).to.be.true;
            setting = rule.infer(new Line(''));
            expect(setting).to.be.true;
        });

        it('infers "false" setting when trailing whitespace is found', function() {
            var setting;
            setting = rule.infer(new Line('foo '));
            expect(setting).to.be.false;
            setting = rule.infer(new Line('foo\t '));
            expect(setting).to.be.false;
            setting = rule.infer(new Line('\t \t'));
            expect(setting).to.be.false;
        });

    });

});
