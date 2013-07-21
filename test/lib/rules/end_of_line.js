var rule = require('../../../lib/rules/end_of_line');


describe('end_of_line rule', function() {

    beforeEach(function() {
        reporter.reset();
    });

    describe('check command', function() {

        it('validates "crlf" setting', function() {
            rule.check(context, 'crlf', 'foo\r\nbar\n');
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: lf');
        });

        it('validates "lf" setting', function() {
            rule.check(context, 'lf', 'foo\nbar\r');
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: cr');
        });

        it('validates "cr" setting', function() {
            rule.check(context, 'cr', 'foo\rbar\r\n');
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: crlf');
        });

        it('validates "vt" setting', function() {
            rule.check(context, 'vt', 'foo\u000Bbar\u000C');
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: ff');
        });

        it('validates "ff" setting', function() {
            rule.check(context, 'ff', 'foo\u000Cbar\u000B');
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: vt');
        });

        it('validates "nel" setting', function() {
            rule.check(context, 'nel', 'foo\u00085bar\u2028');
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: ls');
        });

        it('validates "ls" setting', function() {
            rule.check(context, 'ls', 'foo\u2028bar\u0085');
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: nel');
        });

        it('validates "ps" setting', function() {
            rule.check(context, 'ps', 'foo\u2029bar\n');
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Incorrect newline character found: lf');
        });

    });

    describe('fix command', function() {

        it('replaces all newline characters with "lf" when "lf" is the setting', function() {
            var result = rule.fix('lf', 'foo\r\nbar\rbaz\nqux\u000B\u000C\u0085\u2028\u2029');
            expect(result).to.equal('foo\nbar\nbaz\nqux\n\n\n\n\n');
        });

    });

    describe('infer command', function() {

        it('infers "crlf" setting', function() {
            var inferred = rule.infer('foo\r\nbar\nbaz\r\n');
            expect(inferred).to.equal('crlf');
        });

        it('infers "lf" setting', function() {
            var inferred = rule.infer('foo\nbar\r\nbaz\n');
            expect(inferred).to.equal('lf');
        });

        it('infers "cr" setting', function() {
            var inferred = rule.infer('foo\rbar\nbaz\r');
            expect(inferred).to.equal('cr');
        });

        it('infers "vt" setting', function() {
            var inferred = rule.infer('foo\u000Bbar\nbaz\u000B');
            expect(inferred).to.equal('vt');
        });

        it('infers "ff" setting', function() {
            var inferred = rule.infer('foo\u000Cbar\nbaz\u000C');
            expect(inferred).to.equal('ff');
        });

        it('infers "nel" setting', function() {
            var inferred = rule.infer('foo\u0085bar\nbaz\u0085');
            expect(inferred).to.equal('nel');
        });

        it('infers "ls" setting', function() {
            var inferred = rule.infer('foo\u2028bar\nbaz\u2028');
            expect(inferred).to.equal('ls');
        });

        it('infers "ps" setting', function() {
            var inferred = rule.infer('foo\u2029bar\nbaz\u2029');
            expect(inferred).to.equal('ps');
        });

        it('infers nothing when no newline characters exist', function() {
            var inferred = rule.infer('foobarbaz');
            expect(inferred).to.be.undefined;
        });

    });

});
