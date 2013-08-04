var Line = require('../../../lib/Line');
var rule = require('../../../lib/rules/end_of_line');


describe('end_of_line rule', function() {

    var settings = {};
    ['lf', 'crlf', 'cr', 'ls', 'ps'].forEach(function(setting) {
        settings[setting] = { end_of_line: setting };
    });

    beforeEach(function() {
        reporter.reset();
    });

    describe('check command', function() {

        it('validates "lf" setting', function() {
            rule.check(context, settings.lf, new Line('foo\nbar\r'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: cr');
        });

        it('validates "crlf" setting', function() {
            rule.check(context, settings.crlf, new Line('foo\r\nbar\n'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: lf');
        });

        it('validates "cr" setting', function() {
            rule.check(context, settings.cr, new Line('foo\rbar\r\n'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: crlf');
        });

        it('validates "ls" setting', function() {
            rule.check(context, settings.ls, new Line('foo\u2028bar\u2029'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: ps');
        });

        it('validates "ps" setting', function() {
            rule.check(context, settings.ps, new Line('foo\u2029bar\n'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: lf');
        });
    });

    describe('fix command', function() {

        it('replaces newline character with "lf" when "lf" is the setting', function() {
            var line = rule.fix(settings.lf, new Line('foo\r\n'));
            expect(line.all).to.equal('foo\n');
        });

        it('does nothing when there is no setting', function() {
            var line = rule.fix({}, new Line('foo\r\n'));
            expect(line.all).to.equal('foo\r\n');
        });

    });

    describe('infer command', function() {

        it('infers "lf" setting', function() {
            var inferred = rule.infer(new Line('foo\nbar\r\nbaz\n'));
            expect(inferred).to.equal('lf');
        });

        it('infers "crlf" setting', function() {
            var inferred = rule.infer(new Line('foo\r\nbar\nbaz\r\n'));
            expect(inferred).to.equal('crlf');
        });

        it('infers "cr" setting', function() {
            var inferred = rule.infer(new Line('foo\rbar\nbaz\r'));
            expect(inferred).to.equal('cr');
        });

        it('infers "ls" setting', function() {
            var inferred = rule.infer(new Line('foo\u2028bar\nbaz\u2028'));
            expect(inferred).to.equal('ls');
        });

        it('infers "ps" setting', function() {
            var inferred = rule.infer(new Line('foo\u2029bar\nbaz\u2029'));
            expect(inferred).to.equal('ps');
        });

        it('infers nothing when no newline characters exist', function() {
            var inferred = rule.infer(new Line('foobarbaz'));
            expect(inferred).to.be.undefined;
        });
    });

});
