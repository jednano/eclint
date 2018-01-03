import * as _ from 'lodash';
import * as doc from '../doc';

import * as eclint from '../eclint';
import EditorConfigError = require('../editor-config-error');

function resolve(settings: eclint.ISettings) {
	if (_.isBoolean(settings.trim_trailing_whitespace)) {
		return settings.trim_trailing_whitespace;
	}
	return void(0);
}

function check(settings: eclint.ISettings, line: doc.Line) {
	const configSetting = resolve(settings);
	if (configSetting && !infer(line)) {
		const error = new EditorConfigError('unexpected trailing whitespace');
		error.lineNumber = line.number;
		error.columnNumber = line.prefix.length + line.string.length + 1;
		error.rule = 'trim_trailing_whitespace';
		error.source = line.text;
		return error;
	}
}

function fix(settings: eclint.ISettings, line: doc.Line) {
	const configSetting = resolve(settings);
	if (configSetting) {
		line.suffix = '';
	}
	return line;
}

function infer(line: doc.Line) {
	return !line.suffix || void(0);
}

const TrimTrailingWhitespaceRule: eclint.ILineRule = {
	check,
	fix,
	infer,
	resolve,
	type: 'LineRule',
};

export = TrimTrailingWhitespaceRule;
