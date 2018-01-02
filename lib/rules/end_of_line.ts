import * as doc from '../doc';
import * as eclint from '../eclint';
import EditorConfigError = require('../editor-config-error');

const newlines = {
	'\n': 'lf',
	'\r': 'cr',
	'\r\n': 'crlf',
	'cr': '\r',
	'crlf': '\r\n',
	'lf': '\n',
};

function resolve(settings: eclint.ISettings) {
	switch (settings.end_of_line) {
		case 'lf':
		case 'crlf':
		case 'cr':
			return settings.end_of_line;
		default:
			return void (0);
	}
}

function check(settings: eclint.ISettings, line: doc.Line) {
	const configSetting = resolve(settings);
	if (!configSetting) {
		return;
	}
	const inferredSetting = infer(line);
	if (!inferredSetting) {
		return;
	}
	if (inferredSetting !== configSetting) {
		const error = new EditorConfigError(
			'invalid newline: %s, expected: %s',
			inferredSetting,
			configSetting,
		);
		error.lineNumber = line.number;
		error.columnNumber = line.text.length + 1;
		error.rule = 'end_of_line';
		error.source = line.text + line.ending;
		return error;
	}
}

function fix(settings: eclint.ISettings, line: doc.Line) {
	const configSetting = resolve(settings);
	if (line.ending && configSetting) {
		line.ending = newlines[configSetting];
	}
	return line;
}

function infer(line: doc.Line): string {
	return newlines[line.ending];
}

const EndOfLineRule: eclint.ILineRule = {
	check,
	fix,
	infer,
	resolve,
	type: 'LineRule',
};

export = EndOfLineRule;
