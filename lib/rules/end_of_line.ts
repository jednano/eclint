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

function resolve(settings: eclint.Settings) {
	switch (settings.end_of_line) {
		case 'lf':
		case 'crlf':
		case 'cr':
			return settings.end_of_line;
		default:
			return void (0);
	}
}

function check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
	var configSetting = resolve(settings);
	if (!configSetting) {
		return;
	}
	var inferredSetting = infer(line);
	if (!inferredSetting) {
		return;
	}
	if (inferredSetting !== configSetting) {
		context.report([
			'line ' + line.number + ':',
			'invalid newline: ' + inferredSetting + ',',
			'expected: ' + configSetting
		].join(' '));
	}
}

function fix(settings: eclint.Settings, line: linez.Line) {
	var configSetting = resolve(settings);
	if (line.ending && configSetting) {
		line.ending = newlines[configSetting];
	}
	return line;
}

function infer(line: linez.Line): string {
	return newlines[line.ending];
}

var EndOfLineRule: eclint.LineRule = {
	type: 'LineRule',
	resolve: resolve,
	check: check,
	fix: fix,
	infer: infer
};

export = EndOfLineRule;
