var rule = require('../../../lib/rules/trim_trailing_whitespace');


describe('trim_trailing_whitespace rule', function() {

    beforeEach(function() {
        reporter.reset();
    });

    describe('true setting', function() {

        it('reports trailing whitespace', function() {
            rule.check(context, true, 'foo \n');
            rule.check(context, true, 'foo	 \r\n');
            expect(reporter).to.have.been.calledTwice;
            expect(reporter.alwaysCalledWithExactly('Trailing whitespace found.')).to.be.ok;
        });

    });

    describe('false setting', function() {

        it('ignores trailing whitespace', function() {
            rule.check(context, false, 'foo \n');
            expect(reporter).to.not.have.been.calledWith('Trailing whitespace found.');
        });

    });

});
