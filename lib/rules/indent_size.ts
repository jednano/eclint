///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
import _ = require('lodash');
import linez = require('linez');
import eclint = require('../eclint');

function check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
	var indentSize = resolveRule(settings);
	if (typeof indentSize === 'string') {
		return;
	}
	if (settings.indent_style === 'tab') {
		return;
	}
	var inferredSetting = infer(line);
	if (inferredSetting === 'tab') {
		return;
	}
	if (<number>inferredSetting % <number>indentSize !== 0) {
		context.report('Invalid indent size detected: ' + inferredSetting);
	}
}

function fix(settings: eclint.Settings, line: linez.Line) {
	var indentSize = resolveRule(settings);

	if (typeof indentSize !== 'number') {
		return line;
	}

	switch (settings.indent_style) {

		case 'tab':
			line.text = line.text.replace(/^ +/, (match: string) => {
				var indentLevel = Math.floor(match.length / <number>indentSize);
				var extraSpaces = _.repeat(' ', match.length % <number>indentSize);
				return _.repeat('\t', indentLevel) + extraSpaces;
			});
			break;

		case 'space':
			line.text = line.text.replace(/^\t+/, (match: string) => {
				return _.repeat(_.repeat(' ', <number>indentSize), match.length);
			});
			break;

		default:
			return line;
	}

	return line;
}

function infer(line: linez.Line): number|string {
	if (line.text[0] === '\t') {
		return 'tab';
	}

	var m = line.text.match(/^ +/);
	if (m) {
		var leadingSpacesLength = m[0].length;
		for (var i = 8; i > 0; i--) {
			if (leadingSpacesLength % i === 0) {
				return i;
			}
		}
	}

	return 0;
}

function resolveRule(settings: eclint.Settings): number|string {
	if (settings.indent_size === 'tab') {
		return settings.tab_width;
	}
	return settings.indent_size;
}

var IndentSizeRule: eclint.LineRule = {
	type: 'LineRule',
	check: check,
	fix: fix,
	infer: infer
};

export = IndentSizeRule;
