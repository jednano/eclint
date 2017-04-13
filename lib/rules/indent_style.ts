import _ = require('lodash');
import * as doc from '../doc';

import eclint = require('../eclint');
import IndentSizeRule = require('./indent_size');
import EditorConfigError =  require('../editor-config-error');

function resolve(settings: eclint.Settings) {
	switch (settings.indent_style) {
		case 'tab':
		case 'space':
			return settings.indent_style;
		default:
			return void (0);
	}
}

function check(settings: eclint.Settings, line: doc.Line) {
	if (!line.prefix) {
		return;
	}

	var indentStyle = resolve(settings);

	if (indentStyle === 'tab' && line.isBlockComment && /^\t* +$/.test(line.prefix)) {
		return;
	}

	function searchString(searchValue: string): number {
		var index = line.prefix.indexOf(searchValue);
		if (index < 0) {
			return 0;
		}
		return index + searchValue.length;
	}

	var tabColumnNumber = searchString('\t');
	var spaceColumnNumber = searchString(' ');
	var errorMessage: string;
	var errorColumnNumber: number;

	if (tabColumnNumber && spaceColumnNumber) {
		errorColumnNumber = Math.max(tabColumnNumber, spaceColumnNumber);
		errorMessage = 'invalid indent style: mixed tabs with spaces';
	} else {
		if (!indentStyle) {
			return;
		} else if (indentStyle === 'space') {
			errorColumnNumber = tabColumnNumber;
			errorMessage = 'invalid indent style: tab, expected: space';
		} else if (indentStyle === 'tab') {
			errorColumnNumber = spaceColumnNumber;
			errorMessage = 'invalid indent style: space, expected: tab';
		}
	}

	if (errorColumnNumber) {
		var error = new EditorConfigError([errorMessage]);
		error.lineNumber = line.number;
		error.columnNumber = errorColumnNumber;
		error.rule = 'indent_style';
		error.source = line.text;
		return error;
	}
}

function identifyIndentation(indentSize: number, line: doc.Line): number {

	var spaceCount = 0;
	var hardTabCount = line.prefix.replace(/ /g, () => {
		spaceCount++;
		return '';
	}).length;
	var softTabCount = spaceCount / indentSize;
	if (indentSize > 2 && softTabCount % 0.5) {
		softTabCount = Math.round(softTabCount);
	} else {
		softTabCount = Math.floor(softTabCount);
	}

	return hardTabCount + softTabCount;
}

function fix(settings: eclint.Settings, line: doc.Line) {
	var fixedIndentation;
	if (line.isBlockComment) {
		fixedIndentation = line.blockCommentStart.prefix + _.repeat(' ', line.padSize);
	} else {
		var indentStyle = resolve(settings);
		var indentSize = IndentSizeRule.resolve(settings);

		if (indentStyle && indentSize) {
			var indentCount = identifyIndentation(indentSize, line);

			if (indentStyle === 'space') {
				fixedIndentation = _.repeat(' ', indentCount * indentSize);
			} else if (indentStyle === 'tab') {
				fixedIndentation = _.repeat('\t', indentCount);
			}
		}
	}

	if (fixedIndentation) {
		line.prefix = fixedIndentation;
	}

	return line;
}

function infer(line: doc.Line) {
	return {
		' ': 'space',
		'\t': 'tab'
	}[line.text[0]];
}

var IndentStyleRule: eclint.LineRule = {
	type: 'LineRule',
	resolve: resolve,
	check: check,
	fix: fix,
	infer: infer
};

export = IndentStyleRule;
