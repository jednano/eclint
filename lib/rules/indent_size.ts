import * as doc from '../doc';
import eclint = require('../eclint');
import EditorConfigError =  require('../editor-config-error');

var RE_LEADING_SPACES = /^ *$/;

function getNumber(num: string | number, fallback?: Function) {
	num = +num;

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

function checkLine(line: doc.Line, indentSize: number): EditorConfigError {
	if (!RE_LEADING_SPACES.test(line.prefix)) {
		return;
	}
	var indentLine: doc.Line;
	var padSize: number;
	if (line.isBlockComment) {
		indentLine = line.blockCommentStart;
		padSize = line.padSize;
	} else if (!line.prefix) {
		return;
	} else {
		indentLine = line;
		padSize = 0;
	}
	var leadingSpacesLength = indentLine.prefix.length;
	var softTabCount = leadingSpacesLength / indentSize;

	if (indentSize % 2) {
		softTabCount = Math.floor(softTabCount);
	} else {
		softTabCount = Math.round(softTabCount);
	}

	var expectedIndentSize = softTabCount * indentSize + padSize;

	if (line.prefix.length !== expectedIndentSize) {
		var error = new EditorConfigError([
			'invalid indent size: %s, expected: %s',
			line.prefix.length,
			expectedIndentSize,
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
			return checkLine(line, indentSize);
		}).filter(Boolean);
	}
	return [];
}

function fix(_settings: eclint.Settings, document: doc.Document) {
	return document; // noop
}

function infer(document: doc.Document): number {
	var scores = {};
	var lastIndentSize = 0;
	var lastLeadingSpacesLength = 0;

	function vote(leadingSpacesLength: number) {
		if (leadingSpacesLength) {
			lastIndentSize = Math.abs(leadingSpacesLength - lastLeadingSpacesLength) || lastIndentSize;
			if (lastIndentSize > 1) {
				scores[lastIndentSize] = scores[lastIndentSize] || 0;
				scores[lastIndentSize]++;
			}
		} else {
			lastIndentSize = 0;
		}
		lastLeadingSpacesLength = leadingSpacesLength;
	}

	document.lines.forEach(line => {
		if (!line.isBlockComment && line.string && RE_LEADING_SPACES.test(line.prefix)) {
			vote(line.prefix.length);
		}
	});

	var bestScore = 0;
	var result = 0;

	for (var indentSize in scores) {
		var score = scores[indentSize];
		if (score > bestScore) {
			bestScore = score;
			result = +indentSize;
		}
	}

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
