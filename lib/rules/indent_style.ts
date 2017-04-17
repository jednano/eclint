import _ = require('lodash');
import * as doc from '../doc';

import eclint = require('../eclint');
import IndentSizeRule = require('./indent_size');
import EditorConfigError =  require('../editor-config-error');

enum IndentStyle {
	ignore,
	tab,
	space,
}

function resolve(settings: eclint.Settings): IndentStyle {
	switch (settings.indent_style) {
		case 'tab':
			return IndentStyle.tab;
		case 'space':
			return IndentStyle.space;
		default:
			return IndentStyle.ignore;
	}
}

function checkLine(line: doc.Line, indentStyle: IndentStyle) {
	if (!line.prefix) {
		return;
	}

	if (indentStyle === IndentStyle.tab && line.isBlockComment && /^\t* +$/.test(line.prefix)) {
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

	if (indentStyle === IndentStyle.space) {
		errorColumnNumber = tabColumnNumber;
		errorMessage = 'invalid indent style: tab, expected: space';
	} else if (indentStyle === IndentStyle.tab) {
		errorColumnNumber = spaceColumnNumber;
		errorMessage = 'invalid indent style: space, expected: tab';
	}

	if (!errorColumnNumber && tabColumnNumber && spaceColumnNumber) {
		errorColumnNumber = Math.max(tabColumnNumber, spaceColumnNumber);
		errorMessage = 'invalid indent style: mixed tabs with spaces';
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

function check(settings: eclint.Settings, document: doc.Document): EditorConfigError[] {
	var indentStyle = resolve(settings);
	return document.lines.map(line => {
		return checkLine(line, indentStyle);
	}).filter(Boolean);
}

function identifyIndentation(indentSize: number, line: doc.Line): number {

	var spaceCount = 0;
	var hardTabCount = line.prefix.replace(/ /g, () => {
		spaceCount++;
		return '';
	}).length;
	var softTabCount = 0;
	if (spaceCount) {
		softTabCount = spaceCount / indentSize;
		if (indentSize > 2 && softTabCount % 0.5) {
			softTabCount = Math.round(softTabCount);
		} else {
			softTabCount = Math.floor(softTabCount);
		}
	}
	return hardTabCount + softTabCount;
}

function getTabWidth(settings: eclint.Settings, document: doc.Document): number {
	var tabWidth = IndentSizeRule.resolve(settings);
	if (isNaN(tabWidth)) {
		tabWidth = IndentSizeRule.infer(document);
	}
	return tabWidth;
}

function fixLine(line: doc.Line, indentStyle: IndentStyle, tabWidth: number) {
	var fixedIndentation;
	if (line.isBlockComment) {
		fixedIndentation = line.blockCommentStart.prefix + _.repeat(' ', line.padSize);
	} else if (indentStyle !== IndentStyle.ignore && tabWidth) {
		var indentCount = identifyIndentation(tabWidth, line);
		switch (indentStyle) {
			case IndentStyle.space:
				fixedIndentation = _.repeat(' ', indentCount * tabWidth);
				break;
			case IndentStyle.tab:
				fixedIndentation = _.repeat('\t', indentCount);
				break;
		}
	}

	if (fixedIndentation) {
		line.prefix = fixedIndentation;
	}

	return line;
}

function fix(settings: eclint.Settings, document: doc.Document) {
	var indentStyle = resolve(settings);
	var tabWidth = getTabWidth(settings, document);
	document.lines.map(line => {
		return fixLine(line, indentStyle, tabWidth);
	});
	return document;
}
function infer(document: doc.Document): string {
	var tabCount = 0;
	var spaceCount = 0;
	document.lines.forEach(line => {
		if (!line.prefix) {
			return;
		} else if (line.prefix[0] === '\t') {
			tabCount++;
		} else if (!line.isBlockComment || line.prefix.length > line.padSize) {
			spaceCount++;
		}
	});
	if (!spaceCount && !tabCount) {
		return;
	}
	return spaceCount > tabCount ? 'space' : 'tab';
}

var IndentStyleRule: eclint.DocumentRule = {
	type: 'DocumentRule',
	resolve: resolve,
	check: check,
	fix: fix,
	infer: infer
};

export = IndentStyleRule;
