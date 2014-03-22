import linez = require('linez');

import Cardinality = require('../Cardinality');
import ISettings = require('../interfaces/ISettings');
import Rule = require('./Rule');


class MaxLineLengthRule extends Rule {

	get needs() {
		return ['max_line_length'];
	}

	private maxLineLength: number;
	private tryParseMaxLineLength() {
		var maxLineLength = this.settings['max_line_length'];
		if (typeof maxLineLength === 'undefined') {
			return false;
		}
		this.maxLineLength = maxLineLength;
		return true;
	}

	check(doc: linez.Document) {
		if (!this.tryParseMaxLineLength()) {
			return;
		}
		doc.lines.forEach(line => {
			var lineLength = line.text.length;
			if (lineLength > this.maxLineLength) {
				this.logger.error(new Error(
					'Line ' + line.number + ' exceeds ' +
					'max line length: ' + this.maxLineLength
				));
			}
		});
	}

	fix(doc: linez.Document): linez.Document {
		if (this.tryParseMaxLineLength()) {
			var inferredMaxLineLength = this.inferMaxLineLength(doc);
			if (inferredMaxLineLength > this.maxLineLength) {
				this.logger.warn('Unable to fix max line length (unsupported)');
			}
		}
		return doc;
	}

	infer(doc: linez.Document) {
		var cardinality = new Cardinality();
		cardinality.report('max_line_length', this.inferMaxLineLength(doc));
		return cardinality;
	}

	private inferMaxLineLength(doc: linez.Document): number {
		var maxLength = 0;
		doc.lines.forEach(line => {
			var lineLength = line.text.length;
			if (lineLength > maxLength) {
				maxLength = lineLength;
			}
		});
		return maxLength;
	}

}

export = MaxLineLengthRule;
