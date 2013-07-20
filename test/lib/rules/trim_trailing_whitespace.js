var base = require('./base');

var rule = require('../../../lib/rules/trim_trailing_whitespace');


var expect = base.expect;
var sinon = base.sinon;
var context = base.context;
var reporter = context.report;

describe('trim_trailing_whitespace rule', function() {

    beforeEach(function() {
        reporter.reset();
    });

    describe('true setting', function() {

        it('reports trailing whitespace', function() {
            rule.check(context, true, 'foo \n');
            expect(reporter).to.have.been.calledWith('Trailing whitespace found.');
        });

    });

    describe('false setting', function() {

        it('ignores trailing whitespace', function() {
            rule.check(context, false, 'foo \n');
            expect(reporter).to.not.have.been.calledWith('Trailing whitespace found.');
        });

    });

});
