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

function check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
	if (!settings.end_of_line) {
		return;
	}
	var inferredSetting = infer(line);
	if (inferredSetting !== settings.end_of_line) {
		context.report('Incorrect newline character found: ' + inferredSetting);
	}
}

function fix(settings: eclint.Settings, line: linez.Line) {
	var settingName = settings.end_of_line;
	if (line.ending && settingName) {
		line.ending = newlines[settingName];
	}
	return line;
}

function infer(line: linez.Line): string {
	return newlines[line.ending];
}

var EndOfLineRule: eclint.LineRule = {
	type: 'LineRule',
	check: check,
	fix: fix,
	infer: infer
};

export = EndOfLineRule;
