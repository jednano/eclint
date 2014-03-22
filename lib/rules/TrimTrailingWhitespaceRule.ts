import linez = require('linez');

import Cardinality = require('../Cardinality');
import ISettings = require('../interfaces/ISettings');
import Rule = require('./Rule');


class TrimTrailingWhitespaceRule extends Rule {

	get needs() {
		return ['trim_trailing_whitespace'];
	}

	private get trimTrailingWhitespace() {
		return this.settings['trim_trailing_whitespace'];
	}

	private trailingWhitespace = /[ \t]+$/;

	check(doc: linez.Document): void {
		if (!this.trimTrailingWhitespace) {
			return;
		}
		doc.lines.forEach(line => {
			if (this.trailingWhitespace.test(line.text)) {
				this.logger.error(new Error('Trailing whitespace ' +
					'detected on line: ' + line.number));
			}
		});
	}

	fix(doc: linez.Document) {
		if (this.trimTrailingWhitespace) {
			doc.lines.forEach(line => {
				if (this.trailingWhitespace.test(line.text)) {
					line.text = line.text.replace(this.trailingWhitespace, '');
				}
			});
		}
		return doc;
	}

	infer(doc: linez.Document) {
		var cardinality = new Cardinality();
		for (var i = 0, lineCount = doc.lines.length; i < lineCount; i++) {
			var line = doc.lines[i];
			if (this.trailingWhitespace.test(line.text)) {
				cardinality.report('trim_trailing_whitespace', false);
				return cardinality;
			}
		}
		cardinality.report('trim_trailing_whitespace', true);
		return cardinality;
	}

}
