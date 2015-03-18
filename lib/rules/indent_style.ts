///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
import _ = require('lodash');
import linez = require('linez');
import eclint = require('../eclint');

var DEFAULT_INDENT_SIZE = 4;
var HARD_TAB = '\t';

function check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
	if (typeof settings.indent_style === 'undefined') {
		return;
	}
	var inferredSetting = infer(line);
	if (typeof inferredSetting === 'undefined') {
		return;
	}
	if (inferredSetting !== settings.indent_style) {
		context.report('Invalid indent style: ' + inferredSetting);
	}
}

function fix(settings: eclint.Settings, line: linez.Line) {
	var indentStyle = infer(line);

	if (!indentStyle || indentStyle === settings.indent_style) {
		return line;
	}

	var oldIndent: string;
	var newIndent: string;
	var softTab = _.repeat(' ', resolveIndentSize(settings));
	if (settings.indent_style === 'tab') {
		oldIndent = softTab;
		newIndent = HARD_TAB;
	} else {
		oldIndent = HARD_TAB;
		newIndent = softTab;
	}

	var leadingIndentation = new RegExp('^(?:' + oldIndent + ')+');
	line.text = line.text.replace(leadingIndentation, match => {
		return _.repeat(newIndent, match.length / oldIndent.length);
	});

	return line;
}

function infer(line: linez.Line) {
	return reverseMap[line.text[0]];
}

var reverseMap = {
	' ': 'space',
	'\t': 'tab'
};

function resolveIndentSize(settings: eclint.Settings): number {
	if (settings.indent_size === 'tab') {
		return settings.tab_width || DEFAULT_INDENT_SIZE;
	}
	return <number>settings.indent_size || settings.tab_width || DEFAULT_INDENT_SIZE;
}

var IndentStyleRule: eclint.LineRule = {
	type: 'LineRule',
	check: check,
	fix: fix,
	infer: infer
};

export = IndentStyleRule;
