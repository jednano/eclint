///<reference path="../../bower_components/dt-node/node.d.ts" />
///<reference path="../../node_modules/linez/linez.d.ts" />
import linez = require('linez');
import os = require('os');

import Cardinality = require('../Cardinality');
import newlines = require('../newlines');
import reverseNewlines = require('../reverseNewlines');
import Rule = require('./Rule');


class EndOfLineRule extends Rule {

	get needs() {
		return ['end_of_line'];
	}

	private EOL: string;
	private tryParseEOL() {
		// ReSharper disable once InconsistentNaming
		var EOL = newlines[this.settings['end_of_line']];
		if (typeof EOL === 'undefined') {
			return false;
		}
		this.EOL = EOL;
		return true;
	}

	check(doc: linez.Document) {
		if (!this.tryParseEOL()) {
			return;
		}
		doc.lines.forEach(line => {
			if (line.ending !== this.EOL) {
				this.logger.error(new Error('Incorrect newline character found' +
					' on line: ' + line.number));
			}
		});
	}

	fix(doc: linez.Document) {
		if (this.tryParseEOL()) {
			doc.lines.forEach(line => {
				line.ending = this.EOL;
			});
		}
		return doc;
	}

	infer(doc: linez.Document) {
		var cardinality = new Cardinality();
		doc.lines.forEach(line => {
			var detectedNewline = reverseNewlines[line.ending];
			if (detectedNewline) {
				cardinality.report('end_of_line', detectedNewline);
			}
		});
		return cardinality;
	}

}

export = EndOfLineRule;
