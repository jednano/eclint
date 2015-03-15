import linez = require('linez');
import eclint = require('../eclint');

var TRAILING_WHITESPACE = /[\t ]+$/;

var TrimTrailingWhitespaceRule: eclint.LineRule = {

	type: 'LineRule',

	check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
		if (isSettingTrue(settings) && TRAILING_WHITESPACE.test(line.text)) {
			context.report('Trailing whitespace found.');
		}
	},

	fix(settings: eclint.Settings, line: linez.Line) {
		if (isSettingTrue(settings)) {
			line.text = line.text.replace(TRAILING_WHITESPACE, '');
		}
		return line;
	},

	infer(line: linez.Line) {
		return !TRAILING_WHITESPACE.test(line.text);
	}

};

function isSettingTrue(settings: eclint.Settings) {
	return settings.trim_trailing_whitespace;
}

export = TrimTrailingWhitespaceRule;
