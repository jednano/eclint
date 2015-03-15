import linez = require('linez');
import eclint = require('../eclint');

var TRAILING_WHITESPACE = /[\t ]+$/;

function check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
	if (isSettingTrue(settings) && !infer(line)) {
		context.report('Trailing whitespace found.');
	}
}

function fix(settings: eclint.Settings, line: linez.Line) {
	if (isSettingTrue(settings)) {
		line.text = line.text.replace(TRAILING_WHITESPACE, '');
	}
	return line;
}

function infer(line: linez.Line) {
	return !TRAILING_WHITESPACE.test(line.text);
}

function isSettingTrue(settings: eclint.Settings) {
	return settings.trim_trailing_whitespace;
}

var TrimTrailingWhitespaceRule: eclint.LineRule = {
	type: 'LineRule',
	check: check,
	fix: fix,
	infer: infer
};

export = TrimTrailingWhitespaceRule;
