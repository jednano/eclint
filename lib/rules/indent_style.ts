import _ = require('lodash');

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

function check(settings: eclint.Settings, line: eclint.Line) {
	function createError(message: any[], columnNumber: number = 1) {
		var error = new EditorConfigError(message);
		error.lineNumber = line.number;
		error.columnNumber = columnNumber;
		error.rule = 'indent_style';
		error.source = line.text;
		return error;
	}

	switch (resolve(settings)) {
		case 'tab':
			if (_.startsWith(line.text, ' ')) {
				return createError(['invalid indent style: found a leading space, expected: tab']);
			}
			var softTabCount = identifyIndentation(line, settings).softTabCount;
			if (softTabCount > 0) {
				return createError(['invalid indent style: found %s soft tab(s)', softTabCount]);
			}
			break;
		case 'space':
			if (_.startsWith(line.text, '\t')) {
				return createError(['invalid indent style: found a leading tab, expected: space']);
			}
			var hardTabCount = identifyIndentation(line, settings).hardTabCount;
			if (hardTabCount > 0) {
				return createError(['invalid indent style: found %s hard tab(s)', hardTabCount]);
			}
			break;
	}
	var leadingWhitespace = line.text.match(/^(?:\t| )+/);
	if (!leadingWhitespace) {
		return;
	}
	var mixedTabsWithSpaces = leadingWhitespace[0].match(/ \t/);
	if (!mixedTabsWithSpaces) {
		return;
	}
	return createError(['invalid indent style: found mixed tabs with spaces'], mixedTabsWithSpaces.index + 2);
}

function identifyIndentation(line: eclint.Line, settings: eclint.Settings) {
	var softTab = _.repeat(' ', IndentSizeRule.resolve(settings));

	function countHardTabs(s: string): number {
		var hardTabs = s.match(/\t/g);
		return hardTabs ? hardTabs.length : 0;
	}

	function countSoftTabs(s: string): number {
		if (!softTab.length) {
			return 0;
		}
		var softTabs = s.match(new RegExp(softTab, 'g'));
		return softTabs ? softTabs.length : 0;
	}

	var text = line.text;
	if (line.isDocComment) {
		text = text.replace(/^(\s*) \*.*$/, '$1');
	}

	var m = text.match(new RegExp('^(?:\t|' + softTab + ')+'));
	var leadingIndentation = m ? m[0] : '';
	return {
		text: leadingIndentation,
		hardTabCount: countHardTabs(leadingIndentation),
		softTabCount: countSoftTabs(leadingIndentation)
	};
}

function fix(settings: eclint.Settings, line: eclint.Line) {
	var indentStyle = resolve(settings);
	if (_.isUndefined(indentStyle)) {
		return line;
	}
	var indentation = identifyIndentation(line, settings);
	var softTab = _.repeat(' ', IndentSizeRule.resolve(settings));
	var oneFixedIndent: string;
	switch (indentStyle) {
		case 'tab':
			if (!line.isDocComment && indentation.softTabCount === 0) {
				return line;
			}
			oneFixedIndent = '\t';
			break;
		case 'space':
			if (!line.isDocComment && indentation.hardTabCount === 0) {
				return line;
			}
			oneFixedIndent = softTab;
			break;
		default:
			return line;
	}
	var fixedIndentation = _.repeat(oneFixedIndent, indentation.hardTabCount + indentation.softTabCount);
	var text = line.text.substr(indentation.text.length);
	if (line.isDocComment) {
		text = text.replace(/^\s*\*/, ' *');
	}
	line.text = fixedIndentation + text;
	return line;
}

function infer(line: eclint.Line) {
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
