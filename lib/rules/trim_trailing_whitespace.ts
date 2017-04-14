import _ = require('lodash');
import * as doc from '../doc';

import eclint = require('../eclint');
import EditorConfigError =  require('../editor-config-error');

function resolve(settings: eclint.Settings) {
	if (_.isBoolean(settings.trim_trailing_whitespace)) {
		return settings.trim_trailing_whitespace;
	}
	return void(0);
}

function check(settings: eclint.Settings, line: doc.Line) {
	var configSetting = resolve(settings);
	if (configSetting && !infer(line)) {
		var error = new EditorConfigError(['trailing whitespace found']);
		error.lineNumber = line.number;
		error.columnNumber = line.prefix.length + line.string.length + 1;
		error.rule = 'trim_trailing_whitespace';
		error.source = line.text;
		return error;
	}
}

function fix(settings: eclint.Settings, line: doc.Line) {
	var configSetting = resolve(settings);
	if (configSetting) {
		line.suffix = '';
	}
	return line;
}

function infer(line: doc.Line) {
	return !line.suffix || void(0);
}

var TrimTrailingWhitespaceRule: eclint.LineRule = {
	type: 'LineRule',
	resolve: resolve,
	check: check,
	fix: fix,
	infer: infer
};

export = TrimTrailingWhitespaceRule;
