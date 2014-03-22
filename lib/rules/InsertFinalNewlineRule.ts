import linez = require('linez');
import os = require('os');

import Cardinality = require('../Cardinality');
import ISettings = require('../interfaces/ISettings');
import newlines = require('../newlines');
import Rule = require('./Rule');


class InsertFinalNewlineRule extends Rule {

	get needs() {
		return [
			'insert_final_newline',
			'end_of_line'
		];
	}

	private EOL: string;
	private tryParseEOL() {
		this.EOL = newlines[this.settings['end_of_line']] || os.EOL;
		return true;
	}
	
	check(doc: linez.Document) {
		if (this.settings['insert_final_newline']) {
			if (!this.detect(doc)) {
				throw new Error('Expected final newline character');
			}
		} else if (this.detect(doc)) {
			throw new Error('Unexpected final newline character');
		}
	}

	private detect(doc: linez.Document): boolean {
		var lastLine = this.getLastLine(doc);
		return lastLine && lastLine.ending === this.EOL;
	}

	fix(doc: linez.Document): linez.Document {
		if (this.settings['insert_final_newline']) {
			this.enforceFinalNewline(doc);
		} else {
			this.removeFinalNewlines(doc);
		}
		return doc;
	}

	private enforceFinalNewline(doc: linez.Document) {
		if (!this.detect(doc)) {
			var lastLine = this.getLastLine(doc);
			doc.lines.push({
				number: doc.lines.length,
				offset: lastLine ? lastLine.offset + lastLine.text.length +
					lastLine.ending.length : 0,
				text: '',
				ending: this.EOL
			});
		}
	}

	private getLastLine(doc: linez.Document) {
		return doc.lines[doc.lines.length - 1];
	}

	private removeFinalNewlines(doc: linez.Document) {
		while (true) {
			var lastLine = this.getLastLine(doc);
			if (lastLine && lastLine.text.length === 0) {
				doc.lines.pop();
			} else {
				break;
			}
		}
	}

	infer(doc: linez.Document): Cardinality {
		var cardinality = new Cardinality();
		var lastLine = this.getLastLine(doc);
		cardinality.report('insert_final_newline', !!lastLine.ending);
		return cardinality;
	}

}

export = InsertFinalNewlineRule;
