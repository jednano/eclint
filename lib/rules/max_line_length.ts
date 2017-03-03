import _ = require('lodash');
import * as linez from 'linez';

import eclint = require('../eclint');
import EditorConfigError =  require('../editor-config-error');

function resolve(settings: eclint.Settings) {
	return _.isNumber(settings.max_line_length) ? settings.max_line_length : void(0);
}

function check(settings: eclint.Settings, line: linez.Line) {
	var inferredSetting = infer(line);
	var configSetting = resolve(settings);
	if (inferredSetting > settings.max_line_length) {
		var error = new EditorConfigError([
			'line length: ' + inferredSetting + ',',
			'exceeds: ' + configSetting
		].join(' '));
		error.lineNumber = line.number;
		error.columnNumber = settings.max_line_length;
		error.rule = 'max_line_length';
		error.source = line.text;
		return error;
	}
}

function fix(_settings: eclint.Settings, line: linez.Line) {
	return line; // noop
}

function infer(line: linez.Line) {
	return line.text.length;
}

var MaxLineLengthRule: eclint.LineRule = {
	type: 'LineRule',
	resolve: resolve,
	check: check,
	fix: fix,
	infer: infer
};

export = MaxLineLengthRule;
