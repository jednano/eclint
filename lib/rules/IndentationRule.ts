///<reference path="../../bower_components/dt-node/node.d.ts" />
///<reference path="../../node_modules/linez/linez.d.ts" />
import linez = require('linez');
import os = require('os');

import Cardinality = require('../Cardinality');
import ISettings = require('../interfaces/ISettings');

import Rule = require('./Rule');
import s = require('../helpers/string');


class IndentationRule extends Rule {

	get needs() {
		return [
			'indent_style',
			'indent_size',
			'tab_width'
		];
	}

	private indentSize: any;
	private tryParseIndentSize(): boolean {
		var indentSize = this.settings['indent_size'];
		if (indentSize === 'tab') {
			indentSize = this.settings['tab_width'];
		}
		if (isNaN(indentSize)) {
			return false;
		}
		this.indentSize = indentSize;
		return true;
	}

	private oneIndent: string;
	private tryParseOneIndent(): boolean {
		var indentStyle = this.settings['indent_style'];
		if (indentStyle === 'tab') {
			this.oneIndent = '\t';
			return true;
		}
		if (this.tryParseIndentSize()) {
			this.oneIndent = s.repeat(' ', this.indentSize);
			return true;
		}
		return false;
	}

	private leadingTabs = /^\t+/;
	private leadingSpaces = /^ +/;

	check(doc: linez.Document) {
		if (!this.tryParseOneIndent()) {
			return;
		}
		doc.lines.forEach((this.oneIndent === '\t')
			? this.reportLeadingSpaces
			: this.reportLeadingTabs);
	}

	private reportLeadingSpaces(line: linez.ILine) {
		if (this.leadingSpaces.test(line.text)) {
			this.reportInvalidIndentation(line, 'spaces');
		}
	}

	private reportLeadingTabs(line: linez.ILine) {
		if (this.leadingTabs.test(line.text)) {
			this.reportInvalidIndentation(line, 'tabs');
		}
	}

	private reportInvalidIndentation(line: linez.ILine, invalidType: string) {
		this.logger.error(new Error('Invalid indentation (' + invalidType + ') ' +
			'detected on line: ' + line.number));
	}

	fix(doc: linez.Document) {
		if (!this.tryParseOneIndent()) {
			return doc;
		}
		if (this.oneIndent === '\t') {
			this.replaceLeadingSpacesWithTabs(doc);
		} else {
			this.replaceLeadingTabsWithSpaces(doc);
		}
		return doc;
	}

	private replaceLeadingSpacesWithTabs(doc: linez.Document) {
		var oldIndent = s.repeat(' ', this.indentSize);
		var allOldIndents = new RegExp(oldIndent, 'g');
		doc.lines.forEach(line => {
			line.text = line.text.replace(this.leadingSpaces, (match) => {
				return match.replace(allOldIndents, this.oneIndent);
			});
		});
	}

	private replaceLeadingTabsWithSpaces(doc: linez.Document) {
		doc.lines.forEach(line => {
			line.text = line.text.replace(this.leadingTabs, (match) => {
				return match.replace(/\t/g, this.oneIndent);
			});
		});
	}

	infer(doc: linez.Document) {
		var cardinality = new Cardinality();
		var lastLineLeadingSpaces: number;
		doc.lines.forEach(line => {
			var leadingTabs = this.getNumberOfLeadingTabs(line.text);
			if (leadingTabs > 0) {
				cardinality.report('indent_style', 'tab');
				cardinality.report('indent_size', leadingTabs);
				return;
			}
			var leadingSpaces = this.getNumberOfLeadingSpaces(line.text);
			if (leadingSpaces > 0) {
				cardinality.report('indent_style', 'space');
				for (var i = 8; i > 0; i--) {
					if (leadingSpaces % i === 0) {
						if (!lastLineLeadingSpaces || lastLineLeadingSpaces % i === 0) {
							cardinality.report('indent_size', i);
						}
					}
				}
				lastLineLeadingSpaces = leadingSpaces;
				return;
			}
			cardinality.report('indent_size', 0);
			lastLineLeadingSpaces = 0;
		});
		return cardinality;
	}

	private getNumberOfLeadingTabs(text: string) {
		var m = text.match(this.leadingTabs);
		return m ? m[0].length : 0;
	}

	private getNumberOfLeadingSpaces(text: string) {
		var m = text.match(this.leadingSpaces);
		return m ? m[0].length : 0;
	}

	private incrementSetting(settings: ISettings, key: string) {
		settings[key] = settings[key] || 0;
		settings[key]++;
	}

}

export = IndentationRule;
