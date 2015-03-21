///<reference path="../../typings/lodash/lodash.d.ts" />
import _ = require('lodash');
import linez = require('linez');

import eclint = require('../eclint');

function resolve(settings: eclint.Settings) {
	return _.isNumber(settings.max_line_length) ? settings.max_line_length : void(0);
}

function check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
	var inferredSetting = infer(line);
	var configSetting = resolve(settings);
	if (inferredSetting > settings.max_line_length) {
		context.report([
			'Line length ' + inferredSetting + ' exceeds max_line_length',
			'setting of ' + configSetting,
			'on line number ' + line.number
		].join(' '));
	}
}

function fix(settings: eclint.Settings, line: linez.Line) {
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
