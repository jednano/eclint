var Line = require('../../lib/Line');


describe('Line class', function() {

    describe('Byte Order Mark (BOM signature)', function() {

        it('ignores BOM signature when not line number 1', function() {
            var line = new Line('\u00EF\u00BB\u00BFfoo\n');
            expect(line.bom).to.be.undefined;
            expect(line.charset).to.be.undefined;
            expect(line.text).to.equal('\u00EF\u00BB\u00BFfoo');
        });

        it('detects BOM signature when assigned line number 1', function() {
            var line = new Line('\u00EF\u00BB\u00BFfoo');
            expect(line.bom).to.be.undefined;
            line.number = 1;
            expect(line.bom).to.equal('\u00EF\u00BB\u00BF');
            expect(line.charset).to.equal('utf-8-bom');
            expect(line.text).to.equal('foo');
        });

        it('detects utf-8-bom charset', function() {
            var line = new Line('\u00EF\u00BB\u00BFfoo\n', { number: 1 });
            expect(line.bom).to.equal('\u00EF\u00BB\u00BF');
            expect(line.charset).to.equal('utf-8-bom');
        });

        it('detects utf-16be charset', function() {
            var line = new Line('\u00FE\u00FFfoo', { number: 1 });
            expect(line.bom).to.equal('\u00FE\u00FF');
            expect(line.charset).to.equal('utf-16be');
        });

        it('detects utf-16le charset', function() {
            var line = new Line('\u00FF\u00FEfoo', { number: 1 });
            expect(line.bom).to.equal('\u00FF\u00FE');
            expect(line.charset).to.equal('utf-16le');
        });

        it('detects utf-32le charset', function() {
            var line = new Line('\u00FF\u00FE\u0000\u0000foo', { number: 1 });
            expect(line.bom).to.equal('\u00FF\u00FE\u0000\u0000');
            expect(line.charset).to.equal('utf-32le');
        });

        it('detects utf-32be charset', function() {
            var line = new Line('\u0000\u0000\u00FE\u00FFfoo', { number: 1 });
            expect(line.bom).to.equal('\u0000\u0000\u00FE\u00FF');
            expect(line.charset).to.equal('utf-32be');
        });

        it('allows creation of a solo BOM signature character', function() {
            var line = new Line('\u0000\u0000\u00FE\u00FF', { number: 1 });
            expect(line.bom).to.equal('\u0000\u0000\u00FE\u00FF');
            expect(line.charset).to.equal('utf-32be');
        });

    });

    it('separates line text from the BOM signature and newline character', function() {
        var line = new Line('\u00EF\u00BB\u00BFfoo\n', { number: 1 });
        expect(line.bom).to.equal('\u00EF\u00BB\u00BF');
        expect(line.charset).to.equal('utf-8-bom');
        expect(line.text).to.equal('foo');
        expect(line.newline.char).to.equal('\n');
        expect(line.raw).to.equal('\u00EF\u00BB\u00BFfoo\n');
    });

    it('allows creation of an undefined line', function() {
        var line = new Line();
        expect(line.number).to.be.undefined;
        expect(line.bom).to.be.undefined;
        expect(line.charset).to.be.undefined;
        expect(line.text).to.be.undefined;
        expect(line.newline).to.be.undefined;
        expect(line.raw).to.be.undefined;
    });

    it('allows creation of an empty line, but the text is undefined', function() {
        var line = new Line('');
        expect(line.text).to.be.undefined;
    });

    it('allows creation of a solo newline character', function() {
        var line = new Line('\n');
        expect(line.text).to.be.undefined;
        expect(line.newline.char).to.equal('\n');
    });

    it('throws an InvalidBomError if the BOM is invalid or unsupported', function() {
        var fn = function() {
            new Line({ bom: '\u00AA' });
        };
        expect(fn).to.throw(Line.prototype.InvalidBomError);
    });

    it('throws an InvalidCharsetError if the charset is invalid or unsupported', function() {
        var fn = function() {
            new Line({ charset: 'foo' });
        };
        expect(fn).to.throw(Line.prototype.InvalidCharsetError);
    });

});
