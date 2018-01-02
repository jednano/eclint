import * as doc from '../doc';

import * as eclint from '../eclint';
import EditorConfigError = require('../editor-config-error');

function resolve(settings: eclint.ISettings) {
	return settings.max_line_length > 0 ? settings.max_line_length : void(0);
}

function check(settings: eclint.ISettings, line: doc.Line) {
	const inferredSetting = infer(line);
	const configSetting = resolve(settings);
	if (inferredSetting > settings.max_line_length) {
		const error = new EditorConfigError(
			'invalid line length: %s, exceeds: %s',
			inferredSetting,
			configSetting,
		);
		error.lineNumber = line.number;
		error.columnNumber = settings.max_line_length;
		error.rule = 'max_line_length';
		error.source = line.text;
		return error;
	}
}

function fix(_settings: eclint.ISettings, line: doc.Line) {
	return line; // noop
}

function infer(line: doc.Line) {
	return line.text.length;
}

const MaxLineLengthRule: eclint.ILineRule = {
	check,
	fix,
	infer,
	resolve,
	type: 'LineRule',
};

export = MaxLineLengthRule;
