///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
import _ = require('lodash');
import linez = require('linez');

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

function check(settings: eclint.Settings, line: linez.Line) {
	function creatErroe(message: string, columnNumber: number = 1) {
		message = message.replace(/\b(\d+)\s.+?$/, function(str, count) {
			if (+count > 1) {
				str += 's'
			}
			return str;
		})
		var error = new EditorConfigError(message);
		error.lineNumber = line.number;
		error.columnNumber = columnNumber;
		error.rule = 'indent_style';
		error.source = line.text;
		return error;
	}

	function complex(count: number) {
		return softTabCount > 1 ? 's' : '';
	}

	switch (resolve(settings)) {
		case 'tab':
			if (_.startsWith(line.text, ' ')) {
				return creatErroe('invalid indentation: found a leading space, expected: tab');
			}
			var softTabCount = identifyIndentation(line.text, settings).softTabCount;
			if (softTabCount > 0) {
				return creatErroe('invalid indentation: found ' + softTabCount + ' soft tab');
			}
			break;
		case 'space':
			if (_.startsWith(line.text, '\t')) {
				return creatErroe('invalid indentation: found a leading tab, expected: space');
			}
			var hardTabCount = identifyIndentation(line.text, settings).hardTabCount;
			if (hardTabCount > 0) {
				return creatErroe('invalid indentation: found ' + hardTabCount + ' hard tab');
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
	return creatErroe('invalid indentation: found mixed tabs with spaces', mixedTabsWithSpaces.index + 2);
}

function identifyIndentation(text: string, settings: eclint.Settings) {
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

	var m = text.match(new RegExp('^(?:\t|' + softTab + ')+'));
	var leadingIndentation = m ? m[0] : '';
	return {
		text: leadingIndentation,
		hardTabCount: countHardTabs(leadingIndentation),
		softTabCount: countSoftTabs(leadingIndentation)
	};
}

function fix(settings: eclint.Settings, line: linez.Line) {
	var indentStyle = resolve(settings);
	if (_.isUndefined(indentStyle)) {
		return line;
	}
	var indentation = identifyIndentation(line.text, settings);
	var softTab = _.repeat(' ', IndentSizeRule.resolve(settings));
	var oneFixedIndent: string;
	switch (indentStyle) {
		case 'tab':
			if (indentation.softTabCount === 0) {
				return line;
			}
			oneFixedIndent = '\t';
			break;
		case 'space':
			if (indentation.hardTabCount === 0) {
				return line;
			}
			oneFixedIndent = softTab;
			break;
		default:
			return line;
	}
	var fixedIndentation = _.repeat(oneFixedIndent, indentation.hardTabCount + indentation.softTabCount);
	line.text = fixedIndentation + line.text.substr(indentation.text.length);
	return line;
}

function infer(line: linez.Line) {
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
