import * as doc from '../doc';
import eclint = require('../eclint');
import EditorConfigError =  require('../editor-config-error');

var RE_LEADING_SPACES = /^ +$/;

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

function checkSpaces(line: doc.Line, indentSize: number): EditorConfigError {
	if (!RE_LEADING_SPACES.test(line.prefix)) {
		return;
	}
	var leadingSpacesLength = line.prefix.length;
	var padSpacesLength = leadingSpacesLength % indentSize;
	var padSize = line.padSize || 0;

	var softTabCount = leadingSpacesLength / indentSize;
	if (indentSize % 2) {
		softTabCount = Math.floor(softTabCount);
	} else {
		softTabCount = Math.round(softTabCount);
	}

	if (padSpacesLength !== 0 && padSpacesLength !== padSize) {
		var error = new EditorConfigError([
			'invalid indent size: %s, expected: %s',
			leadingSpacesLength,
			softTabCount * indentSize + padSize,
		]);
		error.lineNumber = line.number;
		error.rule = 'indent_size';
		error.source = line.text;
		return error;
	}
}

function check(settings: eclint.Settings, document: doc.Document): EditorConfigError[] {
	if (settings.indent_style === 'tab') {
		return [];
	}
	var indentSize = resolve(settings);
	if (indentSize) {
		return document.lines.map(line => {
			return checkSpaces(line, indentSize);
		}).filter(Boolean);
	}
	return [];
}

function fix(_settings: eclint.Settings, document: doc.Document) {
	return document; // noop
}

function infer(document: doc.Document): number {
	var scores = {};
	var lastIndentSize;
	var lastLineLeadingSpacesLength = 0;

	function vote(leadingSpacesLength: number) {
		var indentSize = Math.abs(leadingSpacesLength - lastLineLeadingSpacesLength);
		if (indentSize) {
			lastIndentSize = indentSize;
		} else if (lastIndentSize) {
			indentSize = lastIndentSize;
		} else {
			return;
		}
		scores[indentSize] = scores[indentSize] || 0;
		scores[indentSize]++;
	}

	document.lines.forEach(line => {
		if (!RE_LEADING_SPACES.test(line.prefix)) {
			return;
		}
		var leadingSpacesLength = line.prefix.length;
		if (line.padSize) {
			leadingSpacesLength -= line.padSize;
		}
		vote(leadingSpacesLength);
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
