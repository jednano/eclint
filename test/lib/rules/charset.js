var Line = require('../../../lib/Line');
var rule = require('../../../lib/rules/charset');


describe('charset rule', function() {

    var settings = {};
    var charsets = [
        'latin1',
        'utf-8',
        'utf-8-bom',
        'utf-16be',
        'utf-16le',
        'utf-32le',
        'utf-32be'
    ];

    charsets.forEach(function(setting) {
        settings[setting] = { charset: setting };
    });

    beforeEach(function() {
        reporter.reset();
    });

    describe('check command', function() {

        it('reports out of range characters for "latin1" setting', function() {
            rule.check(context, settings.latin1, new Line('foo\u0080bar'));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Character out of latin1 range: \u0080');
        });

        it('remains silent on in-range characters for "latin1" setting', function() {
            rule.check(context, settings.latin1, new Line('foo\u007Fbar'));
            expect(reporter).to.not.have.been.called;
        });

        it('reports invalid charsets', function() {
            var line = new Line('\u00EF\u00BB\u00BFfoo', {number: 1});
            rule.check(context, settings['utf-8'], line);
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Invalid charset: utf-8-bom');
        });

        it('validates "utf-8-bom" setting', function() {
            var line = new Line('\u00EF\u00BB\u00BFfoo', {number: 1});
            rule.check(context, settings['utf-8-bom'], line);
            expect(reporter).to.not.have.been.called;
        });

        it('validates "utf-16be" setting', function() {
            var line = new Line('\u00FE\u00FFfoo', {number: 1});
            rule.check(context, settings['utf-16be'], line);
            expect(reporter).to.not.have.been.called;
        });

        it('validates "utf-16le" setting', function() {
            var line = new Line('\u00FF\u00FEfoo', {number: 1});
            rule.check(context, settings['utf-16le'], line);
            expect(reporter).to.not.have.been.called;
        });

        it('validates "utf-32le" setting', function() {
            var line = new Line('\u00FF\u00FE\u0000\u0000foo', {number: 1});
            rule.check(context, settings['utf-32le'], line);
            expect(reporter).to.not.have.been.called;
        });

        it('validates "utf-32be" setting', function() {
            var line = new Line('\u0000\u0000\u00FE\u00FFfoo', {number: 1});
            rule.check(context, settings['utf-32be'], line);
            expect(reporter).to.not.have.been.called;
        });

    });

    describe('fix command', function() {

        it('converts utf-8-bom to utf-32le when "utf-32le" is setting', function() {
            var line = new Line('\u00EF\u00BB\u00BFfoo', {number: 1});
            expect(line.charset).to.equal('utf-8-bom');
            line = rule.fix({charset: 'utf-32le'}, line);
            expect(line.charset).to.equal('utf-32le');
        });

    });

    describe('infer command', function() {

        it('infers "utf-16be" setting', function() {
            var line = new Line('\u00FE\u00FFfoo', {number: 1});
            var inferred = rule.infer(line);
            expect(inferred).to.equal('utf-16be');
        });

    });

});
