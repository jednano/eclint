import eclint = require('../eclint');
import _line = require('../line');

var TRAILING_WHITESPACE = /[\t ]+$/;

class TrimTrailingWhitespaceRule implements eclint.LineRule {

	check(context: eclint.Context, settings: eclint.Settings, line: _line.Line):
		void {

		if (isSettingTrue(settings) && TRAILING_WHITESPACE.test(line.Text)) {
			context.report('Trailing whitespace found.');
		}
	}

	fix(settings: eclint.Settings, line: _line.Line): _line.Line {
		if (isSettingTrue(settings)) {
			line.Text = line.Text.replace(TRAILING_WHITESPACE, '');
		}
		return line;
	}

	infer(line: _line.Line): boolean {
		return !TRAILING_WHITESPACE.test(line.Text);
	}

}

function isSettingTrue(settings: eclint.Settings) {
	return settings.trim_trailing_whitespace;
}

export = TrimTrailingWhitespaceRule;
