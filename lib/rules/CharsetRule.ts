///<reference path="../../bower_components/dt-node/node.d.ts" />
///<reference path="../../node_modules/linez/linez.d.ts" />
var iconv = require('iconv-lite');
var jschardet = require('jschardet');
import linez = require('linez');
import os = require('os');

import Cardinality = require('../Cardinality');
import Rule = require('./Rule');


class CharsetRule extends Rule {

	get needs() {
		return ['charset'];
	}

	private charset: string;
	private tryParseCharset() {
		this.charset = this.settings['charset'];
		return typeof this.charset !== 'undefined';
	}

	check(doc: linez.Document) {
		var detectedCharset = this.detectCharset(doc);
		if (detectedCharset !== this.charset) {
			this.logger.error(new Error('Invalid charset detected: ' +
				detectedCharset));
		}
	}

	private detectCharset(doc: linez.Document) {
		return jschardet.detect(doc.toString()).encoding;
	}

	fix(doc: linez.Document) {
		return linez.parse(iconv.encode(doc.toString(), this.charset));
	}

	infer(doc: linez.Document) {
		var cardinality = new Cardinality();
		cardinality.report('charset', this.detectCharset(doc));
		return cardinality;
	}
}

export = CharsetRule;
