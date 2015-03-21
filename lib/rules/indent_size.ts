///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
import _ = require('lodash');
import linez = require('linez');
import eclint = require('../eclint');

function resolve(settings: eclint.Settings): number {
	var result = (settings.indent_size === 'tab')
		? settings.tab_width
		: settings.indent_size;
	if (!_.isNumber(result)) {
		result = settings.tab_width;
	}
	return _.isNumber(result) ? <number>result : void (0);
}

function check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
	if (settings.indent_style === 'tab') {
		return;
	}
	var configSetting = resolve(settings);
	if (_.isUndefined(configSetting)) {
  	return;
	}
	var inferredSetting = infer(line);
	if (_.isUndefined(inferredSetting)) {
		return;
	}
	if (inferredSetting % configSetting !== 0) {
		context.report([
			'line ' + line.number + ':',
			'invalid indent size: ' + inferredSetting + ',',
			'expected: ' + configSetting
		].join(' '));
	}
}

function fix(settings: eclint.Settings, line: linez.Line) {
	return line; // noop
}

function infer(line: linez.Line): number {
	if (line.text[0] === '\t') {
		return void(0);
	}

	var m = line.text.match(/^ +/);
	if (m) {
		var leadingSpacesLength = m[0].length;
		for (var i = 8; i > 0; i--) {
			if (leadingSpacesLength % i === 0) {
				return i;
			}
		}
	}

	return 0;
}

var IndentSizeRule: eclint.LineRule = {
	type: 'LineRule',
	resolve: resolve,
	check: check,
	fix: fix,
	infer: infer
};

export = IndentSizeRule;
