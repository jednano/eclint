import errorFactory = require('./errorFactory');

var map = {
	// Line Feed, U+000A
	lf: '\n',

	// Carriage Return + Line Feed
	crlf: '\r\n',

	// Carriage Return, U+000D
	cr: '\r',

	// Vertical Tab
	vt: '\u000B',

	// Form Feed
	ff: '\u000C',

	// Next Line
	nel: '\u0085',

	// Line Separator
	ls: '\u2028',

	// Paragraph Separator
	ps: '\u2029'
};

var reverseMap = {};

var chars = Object.keys(map).map((key: string) => {
	var character = map[key];
	reverseMap[character] = key;
	return character;
});

class Newline {

	constructor(public Character: string) {
		if (!Newline.pattern.test(Character)) {
			throw new Newline.InvalidNewlineError(
				'Invalid or unsupported newline character.');
		}
	}

	get Name(): string {
		return reverseMap[this.Character];
	}

	set Name(value: string) {
		this.Character = map[value];
	}

	get Length(): number {
		return this.Character && this.Character.length;
	}

	toString(): string {
		return this.Character;
	}

	static pattern = /\n|\r(?!\n)|\u2028|\u2029|\r\n/;

	static map = map;

	static reverseMap = reverseMap;

	static chars = chars;

	static InvalidNewlineError = errorFactory.create({
		name: 'InvalidNewlineError'
	});
}

export = Newline;
