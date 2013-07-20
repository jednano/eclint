var rule = require('../../../lib/rules/trim_trailing_whitespace');


describe('trim_trailing_whitespace rule', function() {

    beforeEach(function() {
        reporter.reset();
    });

    describe('true setting', function() {

        it('reports trailing whitespace', function() {
            rule.check(context, true, 'foo \n');
            rule.check(context, true, 'foo	 \r\n');
            rule.check(context, true, '	 	\r');
            expect(reporter).to.have.been.calledThrice;
            expect(reporter.alwaysCalledWithExactly('Trailing whitespace found.')).to.be.ok;
        });

        it('remains silent when no trailing whitespace', function() {
            rule.check(context, true, 'foo\n');
            rule.check(context, true, 'foo\r\n');
            rule.check(context, true, '\r');
            expect(reporter).to.not.have.been.called;
        });

    });

    describe('false setting', function() {

        it('ignores trailing whitespace', function() {
            rule.check(context, false, 'foo \n');
            rule.check(context, false, 'foo	 \r\n');
            rule.check(context, false, '	 	\r');
            expect(reporter).to.not.have.been.called;
        });

        it('ignores no trailing whitespace', function() {
            rule.check(context, false, 'foo\n');
            rule.check(context, false, 'foo\r\n');
            rule.check(context, false, '\r');
            expect(reporter).to.not.have.been.called;
        });

    });

});
