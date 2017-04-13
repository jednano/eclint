import * as linez from 'linez';
import eclint = require('./eclint');

function isBlockComment(line: Line, blockComment: string) {
	if (blockComment) {
		return line.string.slice(0, blockComment.length) === blockComment;
	} else {
		return line;
	}
}

function updateDoc(doc: Document, settings?: eclint.Settings) {
	doc.lines = doc.lines.map((rawLine: linez.Line) => {
		return new Line(rawLine);
	});

	if (!settings || !settings.block_comment_start || !settings.block_comment_end) {
		return doc;
	}

	var padSize: number;
	if (settings.block_comment) {
		padSize = Math.max(0, settings.block_comment_start.indexOf(settings.block_comment));
	}

	var docCommentLines: null|Line[];
	doc.lines.forEach((line: Line) => {
		var string = line.string.trim();
		if (settings.block_comment_start === string) {
			docCommentLines = [line];
		} else if (settings.block_comment_end === string) {
			if (docCommentLines) {
				var blockCommentStart = docCommentLines[0];
				blockCommentStart.isBlockCommentStart = true;
				line.isBlockCommentEnd = true;
				docCommentLines.push(line);
				docCommentLines.forEach(line => {
					if (isBlockComment(line, settings.block_comment)) {
						line.isBlockComment = true;
						line.padSize = padSize || 0;
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
	blockCommentStart?: Line;
	padSize: number = 0;
	prefix: string;
	string: string;
	offset: number;
	number: number;
	ending: string;
	constructor(line: linez.Line) {
		for (var prop in line) {
			this[prop] = line[prop];
		}
	}
	set text(text: string) {
		var textArray = text.match(/^([\t ]+)?(.*?)$/);
		this.prefix = textArray[1] || '';
		this.string = textArray[2] || '';
	}
	get text() {
		return this.prefix + this.string;
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
