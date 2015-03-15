var common = require('../test-common');
var rule = require('./charset');
var linez = require('linez');
var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var createLine = common.createLine;
var Doc = linez.Document;
// ReSharper disable WrongExpressionStatement
describe('charset rule', function () {
    beforeEach(function () {
        reporter.reset();
    });
    describe('check command', function () {
        it('reports out of range characters for "latin1" setting', function () {
            rule.check(context, { charset: 'latin1' }, new Doc([createLine('foo\u0080bar')]));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Character out of latin1 range: \u0080');
        });
        it('remains silent on in-range characters for "latin1" setting', function () {
            rule.check(context, { charset: 'latin1' }, new Doc([createLine('foo\u007Fbar')]));
            expect(reporter).to.not.have.been.called;
        });
        it('reports invalid charsets', function () {
            var line = createLine('\u00EF\u00BB\u00BFfoo', { number: 1 });
            rule.check(context, { charset: 'utf-8' }, new Doc([line]));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Invalid charset: utf-8-bom');
        });
        it('validates "utf-8-bom" setting', function () {
            var line = createLine('\u00EF\u00BB\u00BFfoo', { number: 1 });
            rule.check(context, { charset: 'utf-8-bom' }, new Doc([line]));
            expect(reporter).to.not.have.been.called;
        });
        it('validates "utf-16be" setting', function () {
            var line = createLine('\u00FE\u00FFfoo', { number: 1 });
            rule.check(context, { charset: 'utf-16be' }, new Doc([line]));
            expect(reporter).to.not.have.been.called;
        });
        it('validates "utf-16le" setting', function () {
            var line = createLine('\u00FF\u00FEfoo', { number: 1 });
            rule.check(context, { charset: 'utf-16le' }, new Doc([line]));
            expect(reporter).to.not.have.been.called;
        });
        it('validates "utf-32le" setting', function () {
            var line = createLine('\u00FF\u00FE\u0000\u0000foo', { number: 1 });
            rule.check(context, { charset: 'utf-32le' }, new Doc([line]));
            expect(reporter).to.not.have.been.called;
        });
        it('validates "utf-32be" setting', function () {
            var line = createLine('\u0000\u0000\u00FE\u00FFfoo', { number: 1 });
            rule.check(context, { charset: 'utf-32be' }, new Doc([line]));
            expect(reporter).to.not.have.been.called;
        });
        it('reports an expected/missing charset', function () {
            var line = createLine('foo', { number: 1 });
            rule.check(context, { charset: 'utf-8-bom' }, new Doc([line]));
            expect(reporter).to.have.been.calledOnce;
            expect(reporter).to.have.been.calledWithExactly('Expected charset: utf-8-bom');
        });
    });
    describe('fix command', function () {
        it('converts utf-8-bom to utf-32le when "utf-32le" is setting', function () {
            var doc = new Doc([createLine('\u00EF\u00BB\u00BFfoo', { number: 1 })]);
            expect(doc.charset).to.equal('utf-8-bom');
            doc = rule.fix({ charset: 'utf-32le' }, doc);
            expect(doc.charset).to.equal('utf-32le');
        });
    });
    describe('infer command', function () {
        it('infers "utf-16be" setting', function () {
            var doc = new Doc([createLine('\u00FE\u00FFfoo', { number: 1 })]);
            var inferred = rule.infer(doc);
            expect(inferred).to.equal('utf-16be');
        });
    });
});
