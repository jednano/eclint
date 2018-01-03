import * as linez from 'linez';
import * as _ from 'lodash';
import * as eclint from './eclint';

function updateDoc(doc: IDocument, settings?: eclint.ISettings): IDocument {
	doc.lines = doc.lines.map((rawLine: linez.Line) => {
		return new Line(rawLine, doc);
	});

	if (!settings || !settings.block_comment_start || !settings.block_comment_end) {
		return doc;
	}

	let block_comment = settings.block_comment;

	if (!block_comment &&
		settings.block_comment_start[settings.block_comment_start.length - 1] === settings.block_comment_end[0]
	) {
		block_comment = settings.block_comment_end[0];
	}

	let padSize = 0;
	if (block_comment) {
		padSize = Math.max(0, settings.block_comment_start.indexOf(block_comment));
	}

	let docCommentLines: null|Line[];
	doc.lines.forEach((line: Line) => {
		if (_.startsWith(line.string, settings.block_comment_start)) {
			docCommentLines = [line];
		} else if (_.endsWith(line.string, settings.block_comment_end)) {
			if (docCommentLines) {
				const blockCommentStart = docCommentLines[0];
				blockCommentStart.isBlockCommentStart = true;
				const commentStartWidth = settings.block_comment_start.length;
				let currPadSize = /^\s*/.exec(blockCommentStart.string.slice(commentStartWidth))[0].length || 1;
				currPadSize += commentStartWidth;
				line.isBlockCommentEnd = true;
				docCommentLines.push(line);
				docCommentLines.forEach((docCommentLine) => {
					if (block_comment && _.startsWith(docCommentLine.string, block_comment)) {
						docCommentLine.padSize = padSize;
						docCommentLine.isBlockComment = true;
					} else if (docCommentLine.isBlockCommentStart) {
						return;
					} else {
						docCommentLine.padSize = currPadSize;
					}
					docCommentLine.blockCommentStart = blockCommentStart;
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
	public isBlockComment?: boolean = false;
	public isBlockCommentEnd: boolean = false;
	public isBlockCommentStart: boolean = false;
	public blockCommentStart?: Line = null;
	public doc: IDocument;
	public padSize: number = 0;
	public prefix: string;
	public string: string;
	public suffix: string;
	public offset: number;
	public number: number;
	public ending: string;
	constructor(line: linez.Line, doc?: IDocument) {
		_.assign(this, line);

		if (doc) {
			this.doc = doc;
		}
	}
	set text(text: string) {
		const textArray = /^([\t ]*)(.*?)([\t ]*)$/.exec(text);
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

export function create(file: string|Buffer, settings?: eclint.ISettings): IDocument {
	const document = ((linez as any)(file)) as IDocument;
	updateDoc(document, settings);
	return document;
}

export interface IDocument extends linez.Document {
	lines: Line[];
}
