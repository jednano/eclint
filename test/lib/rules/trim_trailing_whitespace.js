var rule = require('../../../lib/rules/trim_trailing_whitespace');


describe('trim_trailing_whitespace rule', function() {

    beforeEach(function() {
        reporter.reset();
    });

    describe('check command', function() {

        describe('true setting', function() {

            it('reports trailing whitespace', function() {
                rule.check(context, true, 'foo \n');
                rule.check(context, true, 'foo	 \r\n');
                rule.check(context, true, '	 	\r');
                expect(reporter).to.have.been.calledThrice;
                expect(reporter).to.always.have.been.calledWithExactly('Trailing whitespace found.');
            });

            it('remains silent when no trailing whitespace is found', function() {
                rule.check(context, true, 'foo\n');
                rule.check(context, true, 'foo\r\n');
                rule.check(context, true, '\r');
                expect(reporter).to.not.have.been.called;
            });

        });

        describe('false setting', function() {

            it('remains silent when trailing whitespace is found', function() {
                rule.check(context, false, 'foo \n');
                rule.check(context, false, 'foo	 \r\n');
                rule.check(context, false, '	 	\r');
                expect(reporter).to.not.have.been.called;
            });

            it('remains silent when no trailing whitespace is found', function() {
                rule.check(context, false, 'foo\n');
                rule.check(context, false, 'foo\r\n');
                rule.check(context, false, '\r');
                expect(reporter).to.not.have.been.called;
            });

        });

    });

    describe('fix command', function() {

        it('true setting replaces trailing whitespace with nothing', function() {
            var result;
            result = rule.fix(true, 'foo \n');
            expect(result).to.equal('foo\n');
            result = rule.fix(true, 'foo	 \r\n');
            expect(result).to.equal('foo\r\n');
            result = rule.fix(true, '	 	\r');
            expect(result).to.equal('\r');
        });

        it('false setting leaves trailing whitespace alone', function() {
            var result;
            result = rule.fix(false, 'foo \n');
            expect(result).to.equal('foo \n');
            result = rule.fix(false, 'foo	 \r\n');
            expect(result).to.equal('foo	 \r\n');
            result = rule.fix(false, '	 	\r');
            expect(result).to.equal('	 	\r');
        });

    });

    describe('infer command', function() {

        it('infers "true" setting when no trailing whitespace is found', function() {
            var result;
            result = rule.infer('foo\n');
            expect(result).to.be.true;
            result = rule.infer('foo\r\n');
            expect(result).to.be.true;
            result = rule.infer('\r');
            expect(result).to.be.true;
        });

        it('infers "false" setting when trailing whitespace is found', function() {
            var result;
            result = rule.infer('foo \n');
            expect(result).to.be.false;
            result = rule.infer('foo	 \r\n');
            expect(result).to.be.false;
            result = rule.infer('	 	\r');
            expect(result).to.be.false;
        });

    });

});
