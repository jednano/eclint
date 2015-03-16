///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
import _ = require('lodash');
import linez = require('linez');
import eclint = require('../eclint');

function check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
	var inferredSetting: number|string;
	if (settings.indent_size === 'tab') {
		inferredSetting = infer(line);
		if (inferredSetting && inferredSetting !== 'tab') {
			context.report('Invalid indent size detected: ' + inferredSetting);
		}
		return;
	}
	if (typeof settings.indent_size !== 'number') {
		return;
	}
	inferredSetting = infer(line);
	if (inferredSetting === 'tab') {
		context.report('Invalid indent size detected: tab');
	}
	if (<number>inferredSetting % <number>settings.indent_size !== 0) {
		context.report('Invalid indent size detected: ' + inferredSetting);
	}
}

function fix(settings: eclint.Settings, line: linez.Line) {
	var indentSize = applyRule(settings);

	switch (settings.indent_style) {

		case 'tab':
			line.text = line.text.replace(/^ +/, (match: string) => {
				var indentLevel = Math.floor(match.length / indentSize);
				var extraSpaces = _.repeat(' ', match.length % indentSize);
				return _.repeat('\t', indentLevel) + extraSpaces;
			});
			break;

		case 'space':
			line.text = line.text.replace(/^\t+/, (match: string) => {
				return _.repeat(_.repeat(' ', indentSize), match.length);
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

function applyRule(settings: eclint.Settings): number {
	if (settings.indent_size === 'tab') {
		return settings.tab_width;
	}
	return <number>settings.indent_size;
}

var IndentSizeRule: eclint.LineRule = {
	type: 'LineRule',
	check: check,
	fix: fix,
	infer: infer
};

export = IndentSizeRule;
