import _ = require('lodash');
import * as linez from 'linez';
import eclint = require('./eclint');

function updateDoc(doc: Document, settings?: eclint.Settings): Document {
	doc.lines = doc.lines.map((rawLine: linez.Line) => {
		return new Line(rawLine, doc);
	});

	if (!settings || !settings.block_comment_start || !settings.block_comment_end) {
		return doc;
	}

	var padSize: number;
	if (settings.block_comment) {
		padSize = Math.max(0, settings.block_comment_start.indexOf(settings.block_comment));
	} else {
		padSize = 0;
	}

	var docCommentLines: null|Line[];
	doc.lines.forEach((line: Line) => {
		if (_.startsWith(line.string, settings.block_comment_start)) {
			docCommentLines = [line];
		} else if (_.endsWith(line.string, settings.block_comment_end)) {
			if (docCommentLines) {
				var blockCommentStart = docCommentLines[0];
				blockCommentStart.isBlockCommentStart = true;
				line.isBlockCommentEnd = true;
				docCommentLines.push(line);
				docCommentLines.forEach(line => {
					if (!settings.block_comment || _.startsWith(line.string, settings.block_comment)) {
						line.isBlockComment = true;
						line.padSize = padSize;
						line.blockCommentStart = blockCommentStart;
					}
				});
			}
			docCommentLines = null;
		} else if (docCommentLines) {
			docCommentLines.push(line);
		}
		return line;
	});
	return doc;
}

export class Line implements linez.Line {
	isBlockComment?: boolean = false;
	isBlockCommentEnd: boolean = false;
	isBlockCommentStart: boolean = false;
	blockCommentStart?: Line = null;
	doc: Document;
	padSize: number = 0;
	prefix: string;
	string: string;
	suffix: string;
	offset: number;
	number: number;
	ending: string;
	constructor(line: linez.Line, doc?: Document) {
		for (var prop in line) {
			this[prop] = line[prop];
		}
		if (doc) {
			this.doc = doc;
		}
	}
	set text(text: string) {
		var textArray = /^([\t ]*)(.*?)([\t ]*)$/.exec(text);
		if (textArray && textArray[2]) {
			this.prefix = textArray[1];
			this.string = textArray[2];
			this.suffix = textArray[3];
		} else {
			this.prefix = '';
			this.string = '';
			this.suffix = text;
		}
	}
	get text() {
		return this.prefix + this.string + this.suffix;
	}
}

export function create(file: any, settings?: eclint.Settings): Document {
	var document = <Document>(linez(file));
	updateDoc(document, settings);
	return document;
}

export interface Document extends linez.Document {
	lines: Line[];
}
