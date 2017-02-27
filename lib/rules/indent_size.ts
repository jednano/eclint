///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
import _ = require('lodash');
import linez = require('linez');
import eclint = require('../eclint');
import EditorConfigError =  require('../editor-config-error');

var LEADING_SPACES_MATCHER = /^ +/;

function resolve(settings: eclint.Settings): number {
	var result = (settings.indent_size === 'tab')
		? settings.tab_width
		: settings.indent_size;
	if (!_.isNumber(result)) {
		result = settings.tab_width;
	}
	return _.isNumber(result) ? <number>result : void (0);
}

function check(context: eclint.Context, settings: eclint.Settings, doc: linez.Document) {
	if (settings.indent_style === 'tab') {
		return;
	}
	var configSetting = resolve(settings);
	if (_.isUndefined(configSetting)) {
		return;
	}
	return doc.lines.map(line => {
		var leadingSpacesLength = getLeadingSpacesLength(line);
		if (_.isUndefined(leadingSpacesLength)) {
			return;
		}
		if (configSetting === 0) {
			return;
		}
		if (leadingSpacesLength % configSetting !== 0) {
			context.report([
				'line ' + line.number + ':',
				'invalid indent size: ' + leadingSpacesLength + ',',
				'expected: ' + configSetting
			].join(' '));
			var error = new EditorConfigError([
				'invalid indent size: ' + leadingSpacesLength + ',',
				'expected: ' + configSetting
			].join(' '));
			error.lineNumber = line.number;
			// error.columnNumber = 1;
			error.rule = 'indent_size';
			error.source = line.text;
			return error;
		}
	});
}

function getLeadingSpacesLength(line: linez.Line): number {
	if (line.text[0] === '\t') {
		return void(0);
	}
	var m = line.text.match(LEADING_SPACES_MATCHER);
	return (m) ? m[0].length : 0;
}

function fix(settings: eclint.Settings, doc: linez.Document) {
	return doc; // noop
}

function infer(doc: linez.Document): number {
	var scores = {};

	function vote(indentSize: number) {
		scores[indentSize] = scores[indentSize] || 0;
		scores[indentSize]++;
	}

	var lastLineLeadingSpacesLength = 0;
	doc.lines.forEach(line => {
		var leadingSpacesLength = getLeadingSpacesLength(line);
		if (_.isUndefined(leadingSpacesLength)) {
			return;
		}
		vote(Math.abs(leadingSpacesLength - lastLineLeadingSpacesLength));
		lastLineLeadingSpacesLength = leadingSpacesLength;
	});

	var bestScore = 0;
	var result = 0;
	Object.keys(scores).forEach(indentSize => {
		var score = scores[indentSize];
		if (score > bestScore) {
			bestScore = score;
			result = +indentSize;
		}
	});

	return result;
}

var IndentSizeRule: eclint.DocumentRule = {
	type: 'DocumentRule',
	resolve: resolve,
	check: check,
	fix: fix,
	infer: infer
};

export = IndentSizeRule;
