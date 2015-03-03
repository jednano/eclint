import util = require('util');
import errorFactory = require('./errorFactory');
import Newline = require('./Newline');

export interface LineOptions {
	number?: number;
	bom?: string;
	charset?: Charsets;
	newline?: Newline;
	text?: string;
}

export enum Charsets {
	latin1,
	utf_8,
	utf_8_bom,
	utf_16be,
	utf_16le,
	utf_32be,
	utf_32le
}

export class Line {
	private _number: number;
	private _bom: string;
	private _newline: Newline;
	private _text: string;
	private _charset: Charsets;

	constructor(raw?: string, options?: LineOptions) {
		options = options || {};
		this._number = options.number;
		if (this._number === 1) {
			this.BOM = parseBom(raw);
		}
		this.Newline = parseNewline(raw);
		this.Text = options.text || this.parseLineForText(raw);
		this.BOM = options.bom || this.BOM;
		this.Charsets = options.charset || reverseBomMap[this.BOM];
	}

	get Number(): number {
		return this._number;
	}

	set Number(value: number) {
		if (!value) {
			delete this._number;
			return;
		}
		this._number = value;
		if (value === 1) {
			var bom = parseBom(this._text);
			if (bom) {
				this._bom = bom;
				this._charset = reverseBomMap[bom];
				this._text = this._text.substr(bom.length);
			}
		} else {
			delete this._bom;
			delete this._charset;
		}
	}

	get BOM(): string {
		return this._bom;
	}

	set BOM(value: string) {
		if (!value) {
			delete this._bom;
			delete this._charset;
			return;
		}
		var charset: Charsets = Charsets[Charsets[reverseBomMap[value]]];
		if (!charset) {
			throw new Line.InvalidBomError(
				'Invalid or unsupported BOM signature.');
		}
		this._bom = value;
		this._charset = charset;
		this._number = 1;
	}

	get Charsets(): Charsets {
		return this._charset;
	}

	set Charsets(value: Charsets) {
		if (!value) {
			delete this._charset;
			delete this._bom;
			return;
		}
		this._charset = value;
		this._bom = bomMap[Charsets[value]];
	}

	get Text(): string {
		return this._text;
	}

	set Text(value: string) {
		if (!value) {
			delete this._text;
			return;
		}
		this._text = value;
	}

	get Newline(): Newline {
		return this._newline;
	}

	set Newline(value: Newline) {
		if (!value) {
			delete this._newline;
			return;
		}
		this._newline = value;
	}

	get Raw(): string {
		if (this._bom || this._text || this._newline) {
			return (this._bom || '') + (this._text || '') +
				(this._newline || '');
		}
		return undefined;
	}

	private parseLineForText(s: string): string {
		if (!s) {
			return undefined;
		}
		var start = this._bom ? this._bom.length : 0;
		var length = s.length - start - (this._newline ? this._newline.Length : 0);
		s = s.substr(start, length);
		if (s !== '') {
			return s;
		}
	}

	public toString() {
		return this._text;
	}

	static InvalidBomError = errorFactory.create({
		name: 'InvalidBomError'
	});

	static InvalidCharsetError = errorFactory.create({
		name: 'InvalidCharsetError'
	});

	static MultipleNewlinesError = errorFactory.create({
		name: 'MultipleNewlinesError'
	});
}

function parseBom(s: string) {
	if (s) {
		var m = s.match(startsWithBom);
		return m && m[1];
	}
}

var bomMap = {
	utf_8_bom: '\u00EF\u00BB\u00BF',
	utf_16be: '\u00FE\u00FF',
	utf_32le: '\u00FF\u00FE\u0000\u0000',
	utf_16le: '\u00FF\u00FE',
	utf_32be: '\u0000\u0000\u00FE\u00FF'
};

var reverseBomMap = {};
var boms = Object.keys(bomMap).map((key: string) => {
	var bom: string = bomMap[key];
	reverseBomMap[bom] = Charsets[key];
	return bom;
});

var startsWithBom = new RegExp('^(' + boms.join('|') + ')');

function parseNewline(s: string): Newline {
	var m = s && s.match(new RegExp(Newline.pattern.source, 'g'));
	if (!m) {
		return;
	}
	if (m.length > 1) {
		throw new Line.MultipleNewlinesError(
			'A line cannot have more than one newline character.');
	}
	return new Newline(m[0]);
}
