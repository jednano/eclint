import _ = require('lodash');
import * as linez from 'linez';
import eclint = require('../eclint');
import EditorConfigError =  require('../editor-config-error');

var LEADING_SPACES_MATCHER = /^ +/;

function getNumber(num: string | number, fallback?: Function) {
	if (typeof num === 'number') {
		return num;
	}

	num = parseInt(num, undefined);

	if (isNaN(num)) {
		return fallback && fallback();
	}
	return num;
}

function resolve(settings: eclint.Settings): number {
	var result = (settings.indent_size === 'tab')
		? settings.tab_width
		: settings.indent_size;

	return getNumber(result, getNumber.bind(this, settings.tab_width));
}

function check(settings: eclint.Settings, doc: linez.Document) {
	if (settings.indent_style === 'tab') {
		return [];
	}
	var configSetting = resolve(settings);
	if (_.isUndefined(configSetting)) {
		return [];
	}
	return doc.lines.map(line => {
		var leadingSpacesLength = getLeadingSpacesLength(<eclint.Line>line);
		if (_.isUndefined(leadingSpacesLength)) {
			return;
		}
		if (configSetting === 0) {
			return;
		}
		if (leadingSpacesLength % configSetting !== 0) {
			var error = new EditorConfigError([
				'invalid indent size: %s, expected: %s',
				leadingSpacesLength,
				configSetting
			]);
			error.lineNumber = line.number;
			error.columnNumber = 1;
			error.rule = 'indent_size';
			error.source = line.text;
			return error;
		}
	}).filter(Boolean);
}

function getLeadingSpacesLength(line: eclint.Line): number {
	if (line.text[0] === '\t') {
		return void(0);
	}
	var text = line.text;
	if (line.isDocComment) {
		text = text.replace(/^(\s*) \*.*$/, '$1');
	}
	var m = text.match(LEADING_SPACES_MATCHER);
	return (m) ? m[0].length : 0;
}

function fix(_settings: eclint.Settings, doc: linez.Document) {
	return doc; // noop
}

function infer(doc: linez.Document): number {
	var scores = {};

	function vote(indentSize: number) {
		scores[indentSize] = scores[indentSize] || 0;
		scores[indentSize]++;
	}

	var lastLineLeadingSpacesLength = 0;
	doc.lines.forEach(line => {
		var leadingSpacesLength = getLeadingSpacesLength(<eclint.Line>line);
		if (_.isUndefined(leadingSpacesLength)) {
			return;
		}
		vote(Math.abs(leadingSpacesLength - lastLineLeadingSpacesLength));
		lastLineLeadingSpacesLength = leadingSpacesLength;
	});

	var bestScore = 0;
	var result = 0;
	Object.keys(scores).forEach(indentSize => {
		var score = scores[indentSize];
		if (score > bestScore) {
			bestScore = score;
			result = +indentSize;
		}
	});

	return result;
}

var IndentSizeRule: eclint.DocumentRule = {
	type: 'DocumentRule',
	resolve: resolve,
	check: check,
	fix: fix,
	infer: infer
};

export = IndentSizeRule;
