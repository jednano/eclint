import isUndefined = require('lodash.isundefined');
import repeat = require('lodash.repeat');
import startsWith = require('lodash.startswith');

import linez = require('linez');

import eclint = require('../eclint');
import IndentSizeRule = require('./indent_size');

function resolve(settings: eclint.Settings) {
	switch (settings.indent_style) {
		case 'tab':
		case 'space':
			return settings.indent_style;
		default:
			return void (0);
	}
}

function check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
	switch (resolve(settings)) {
		case 'tab':
			if (startsWith(line.text, ' ')) {
				context.report([
					'line ' + line.number + ':',
					'invalid indentation: found a leading space, expected: tab'
				].join(' '));
				return;
			}
			var softTabCount = identifyIndentation(line.text, settings).softTabCount;
			if (softTabCount > 0) {
				context.report([
					'line ' + line.number + ':',
					'invalid indentation: found ' + softTabCount + ' soft tab'
				].join(' ') + ((softTabCount > 1) ? 's' : ''));
				return;
			}
			break;
		case 'space':
			if (startsWith(line.text, '\t')) {
				context.report([
					'line ' + line.number + ':',
					'invalid indentation: found a leading tab, expected: space'
				].join(' '));
				return;
			}
			var hardTabCount = identifyIndentation(line.text, settings).hardTabCount;
			if (hardTabCount > 0) {
				context.report([
					'line ' + line.number + ':',
					'invalid indentation: found ' + hardTabCount + ' hard tab'
				].join(' ') + ((hardTabCount > 1) ? 's' : ''));
				return;
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
	context.report([
		'line ' + line.number + ':',
		'invalid indentation: found mixed tabs with spaces'
	].join(' '));
}

function identifyIndentation(text: string, settings: eclint.Settings) {
	var softTab = repeat(' ', IndentSizeRule.resolve(settings));

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
	if (isUndefined(indentStyle)) {
		return line;
	}
	var indentation = identifyIndentation(line.text, settings);
	var softTab = repeat(' ', IndentSizeRule.resolve(settings));
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
	var fixedIndentation = repeat(oneFixedIndent, indentation.hardTabCount + indentation.softTabCount);
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
