import common = require('./test-common');
import _line = require('./line');

var expect = common.expect;
var Line = _line.Line;

// ReSharper disable WrongExpressionStatement
describe('Line class', () => {

	describe('Byte Order Mark (BOM signature)', () => {

		it('detects the BOM, charsets and line number if not given a line number', () => {
			var line = new Line('\u00EF\u00BB\u00BFfoo\n');
			expect(line.BOM).to.eq('\u00EF\u00BB\u00BF');
			expect(line.Number).to.eq(1);
			expect(line.Charsets).to.equal('utf_8_bom');
			expect(line.Text).to.equal('foo');
		});

		it('strips the BOM when assigned line number 2', () => {
			var line = new Line('\u00EF\u00BB\u00BFfoo', { number: 2 });
			expect(line.BOM).to.be.undefined;
			expect(line.Charsets).to.be.undefined;
			expect(line.Text).to.equal('foo');
		});

		it('detects utf-8-bom charset', () => {
			var line = new Line('\u00EF\u00BB\u00BFfoo\n', { number: 1 });
			expect(line.BOM).to.equal('\u00EF\u00BB\u00BF');
			expect(line.Charsets).to.equal('utf_8_bom');
		});

		it('detects utf-16be charset', () => {
			var line = new Line('\u00FE\u00FFfoo', { number: 1 });
			expect(line.BOM).to.equal('\u00FE\u00FF');
			expect(line.Charsets).to.equal('utf_16be');
		});

		it('detects utf-16le charset', () => {
			var line = new Line('\u00FF\u00FEfoo', { number: 1 });
			expect(line.BOM).to.equal('\u00FF\u00FE');
			expect(line.Charsets).to.equal('utf_16le');
		});

		it('detects utf-32le charset', () => {
			var line = new Line('\u00FF\u00FE\u0000\u0000foo', { number: 1 });
			expect(line.BOM).to.equal('\u00FF\u00FE\u0000\u0000');
			expect(line.Charsets).to.equal('utf_32le');
		});

		it('detects utf-32be charset', () => {
			var line = new Line('\u0000\u0000\u00FE\u00FFfoo', { number: 1 });
			expect(line.BOM).to.equal('\u0000\u0000\u00FE\u00FF');
			expect(line.Charsets).to.equal('utf_32be');
		});

		it('allows creation of a solo BOM signature character', () => {
			var line = new Line('\u0000\u0000\u00FE\u00FF', { number: 1 });
			expect(line.BOM).to.equal('\u0000\u0000\u00FE\u00FF');
			expect(line.Charsets).to.equal('utf_32be');
		});

		it('removes the BOM if line number is > 1', () => {
			var line = new Line('\u00EF\u00BB\u00BFfoo\n', { number: 1 });
			expect(line.BOM).to.equal('\u00EF\u00BB\u00BF');
			expect(line.Charsets).to.equal('utf_8_bom');
			line.Number = 2;
			expect(line.BOM).to.be.undefined;
			expect(line.Charsets).to.be.undefined;
		});

	});

	it('removes the line number when set to a falsy value', () => {
		var line = new Line('foo', { number: 1 });
		expect(line.Number).to.eq(1);
		line.Number = void (0);
		expect(line.Number).to.be.undefined;
	});

	it('separates line text from the BOM signature and newline character', () => {
		var line = new Line('\u00EF\u00BB\u00BFfoo\n', { number: 1 });
		expect(line.BOM).to.equal('\u00EF\u00BB\u00BF');
		expect(line.Charsets).to.equal('utf_8_bom');
		expect(line.Text).to.equal('foo');
		expect(line.Newline.Character).to.equal('\n');
		expect(line.Raw).to.equal('\u00EF\u00BB\u00BFfoo\n');
	});

	it('allows creation of an undefined line', () => {
		var line = new Line();
		expect(line.Number).to.be.undefined;
		expect(line.BOM).to.be.undefined;
		expect(line.Charsets).to.be.undefined;
		expect(line.Text).to.be.undefined;
		expect(line.Newline).to.be.undefined;
		expect(line.Raw).to.be.undefined;
	});

	it('allows creation of an empty line, but the text is undefined', () => {
		var line = new Line('');
		expect(line.Text).to.be.undefined;
	});

	it('allows creation of a solo newline character', () => {
		var line = new Line('\n');
		expect(line.Text).to.be.undefined;
		expect(line.Newline.Character).to.equal('\n');
	});

	it('returns only the text portion of the line when converted to a string', () => {
		var line = new Line('\u00EF\u00BB\u00BFfoo\n', { number: 1 });
		expect(line.toString()).to.eq('foo');
	});

	it('throws an InvalidBomError if the BOM is invalid or unsupported', () => {
		var fn = () => {
			new Line('', { bom: '\u00AA' });
		};
		expect(fn).to.throw(Line.InvalidBomError);
	});

	it('throws an error if more than one newline character found', () => {
		var fn = () => {
			new Line('\n\n');
		};
		expect(fn).to.throw(Line.MultipleNewlinesError);
	});

});
