import * as doc from '../doc';
import * as eclint from '../eclint';
import EditorConfigError = require('../editor-config-error');

const RE_LEADING_SPACES = /^ *$/;

function getNumber(num: string | number, fallback?: () => number): number {
	num = +num;

	if (isNaN(num)) {
		return fallback && fallback();
	}
	return num;
}

function resolve(settings: eclint.ISettings): number {
	const result = (settings.indent_size === 'tab')
		? settings.tab_width
		: settings.indent_size;

	return getNumber(result, getNumber.bind(this, settings.tab_width));
}

function checkLine(line: doc.Line, indentSize: number): EditorConfigError {
	if (
		!line.prefix ||
		!RE_LEADING_SPACES.test(line.prefix) ||
		(line.blockCommentStart &&
		line.prefix.length === (
			line.blockCommentStart.prefix.length + line.padSize
		))
	) {
		return;
	}

	let softTabCount = line.prefix.length / indentSize;

	if (indentSize % 2) {
		softTabCount = Math.floor(softTabCount);
	} else {
		softTabCount = Math.round(softTabCount);
	}

	const expectedIndentSize = softTabCount * indentSize;

	if (line.prefix.length !== expectedIndentSize) {
		const error = new EditorConfigError(
			'invalid indent size: %s, expected: %s',
			line.prefix.length,
			expectedIndentSize,
		);
		error.lineNumber = line.number;
		error.rule = 'indent_size';
		error.source = line.text;
		return error;
	}
}

function check(settings: eclint.ISettings, document: doc.IDocument): EditorConfigError[] {
	if (settings.indent_style === 'tab') {
		return [];
	}
	const indentSize = resolve(settings);
	if (indentSize) {
		return document.lines.map((line) => {
			return checkLine(line, indentSize);
		}).filter(Boolean);
	}
	return [];
}

function fix(_settings: eclint.ISettings, document: doc.IDocument) {
	return document; // noop
}

function infer(document: doc.IDocument): number {
	const scores = {};
	let lastIndentSize = 0;
	let lastLeadingSpacesLength = 0;

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

	document.lines.forEach((line) => {
		if (!line.isBlockComment && line.string && RE_LEADING_SPACES.test(line.prefix)) {
			vote(line.prefix.length);
		}
	});

	let bestScore = 0;
	let result = 0;

	for (const indentSize in scores) {
		const score = scores[indentSize];
		if (score > bestScore) {
			bestScore = score;
			result = +indentSize;
		}
	}

	return result;
}

const IndentSizeRule: eclint.IDocumentRule = {
	check,
	fix,
	infer,
	resolve,
	type: 'DocumentRule',
};

export = IndentSizeRule;
