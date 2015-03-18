import linez = require('linez');
import eclint = require('../eclint');

var newlines = {
	lf: '\n',
	'\n': 'lf',

	crlf: '\r\n',
	'\r\n': 'crlf',

	cr: '\r',
	'\r': 'cr'
};

var EndOfLineRule: eclint.LineRule = {
	type: 'LineRule',

	check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
		if (!settings.end_of_line) {
			return;
		}
		var inferredSetting = this.infer(line);
		if (inferredSetting !== settings.end_of_line) {
			context.report('Incorrect newline character found: ' + inferredSetting);
		}
	},

	fix(settings: eclint.Settings, line: linez.Line) {
		var settingName = settings.end_of_line;
		if (line.ending && settingName) {
			line.ending = newlines[settingName];
		}
		return line;
	},

	infer(line: linez.Line): string {
		return newlines[line.ending];
	}
};

export = EndOfLineRule;
