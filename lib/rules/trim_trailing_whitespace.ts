///<reference path="../../typings/lodash/lodash.d.ts" />
import _ = require('lodash');
import linez = require('linez');

import eclint = require('../eclint');
import EditorConfigError =  require('../editor-config-error');

var TRAILING_WHITESPACE = /[\t ]+$/;

function resolve(settings: eclint.Settings) {
	if (_.isBoolean(settings.trim_trailing_whitespace)) {
		return settings.trim_trailing_whitespace;
	}
	return void(0);
}

function check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
	var configSetting = resolve(settings);
	if (configSetting && !infer(line)) {
		context.report([
			'line ' + line.number + ':',
			'trailing whitespace found'
		].join(' '));
		var error = new EditorConfigError([
			'trailing whitespace found'
		].join(' '));
		error.lineNumber = line.number;
		error.columnNumber = line.text.replace(TRAILING_WHITESPACE, '').length + 1;
		error.rule = 'trim_trailing_whitespace';
		error.source = line.text;
		return error;
	}
}

function fix(settings: eclint.Settings, line: linez.Line) {
	var configSetting = resolve(settings);
	if (configSetting) {
		line.text = line.text.replace(TRAILING_WHITESPACE, '');
	}
	return line;
}

function infer(line: linez.Line) {
	if (!TRAILING_WHITESPACE.test(line.text)) {
		return true;
	}
	return void(0);
}

var TrimTrailingWhitespaceRule: eclint.LineRule = {
	type: 'LineRule',
	resolve: resolve,
	check: check,
	fix: fix,
	infer: infer
};

export = TrimTrailingWhitespaceRule;
