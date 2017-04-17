var _ = require('lodash');
import * as doc from '../doc';

import eclint = require('../eclint');
import EditorConfigError =  require('../editor-config-error');

var newlines = {
	lf: '\n',
	crlf: '\r\n',
	cr: '\r'
};

function resolve(settings: eclint.Settings) {
	if (_.isBoolean(settings.insert_final_newline)) {
		return settings.insert_final_newline;
	}
	return void(0);
}

function check(settings: eclint.Settings, document: doc.Document) {
	var configSetting = resolve(settings);
	var inferredSetting = infer(document);
	if (configSetting == null || inferredSetting === configSetting) {
		return [];
	}
	var message: string;
	if (configSetting) {
		message = 'expected final newline';
	} else {
		message = 'unexpected final newline';
	}

	var error = new EditorConfigError([message]);
	error.lineNumber = document.lines.length;
	var lastLine: doc.Line = document.lines[document.lines.length - 1];
	error.columnNumber = lastLine.text.length + lastLine.ending.length;
	error.rule = 'insert_final_newline';
	error.source = lastLine.text + lastLine.ending;
	return [error];
}

function fix(settings: eclint.Settings, document: doc.Document) {
	var lastLine: doc.Line;
	var configSetting = resolve(settings);
	if (configSetting && !infer(document)) {
		lastLine = document.lines[document.lines.length - 1];
		var endOfLineSetting = settings.end_of_line || 'lf';
		if (lastLine) {
			lastLine.ending = newlines[endOfLineSetting];
		} else {
			document.lines.push(new doc.Line({
				number: 1,
				text: '',
				ending: newlines[endOfLineSetting],
				offset: 0
			}));
		}
		return document;
	}
	if (!configSetting) {
		while (infer(document)) {
			lastLine = document.lines[document.lines.length - 1];
			if (lastLine.text) {
				lastLine.ending = '';
				break;
			}
			document.lines.pop();
		}
		return document;
	}
	return document;
}

function infer(document: doc.Document) {
	var lastLine = document.lines[document.lines.length - 1];
	if (lastLine && lastLine.ending) {
		return true;
	}
	return false;
}

var InsertFinalNewlineRule: eclint.DocumentRule = {
	type: 'DocumentRule',
	resolve: resolve,
	check: check,
	fix: fix,
	infer: infer
};

export = InsertFinalNewlineRule;
