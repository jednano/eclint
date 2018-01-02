import * as _ from 'lodash';
import * as doc from '../doc';

import * as eclint from '../eclint';
import EditorConfigError = require('../editor-config-error');

const newlines = {
	cr: '\r',
	crlf: '\r\n',
	lf: '\n',
};

function resolve(settings: eclint.ISettings) {
	if (_.isBoolean(settings.insert_final_newline)) {
		return settings.insert_final_newline;
	}
	return void(0);
}

function check(settings: eclint.ISettings, document: doc.IDocument) {
	const configSetting = resolve(settings);
	const inferredSetting = infer(document);
	if (configSetting == null || inferredSetting === configSetting) {
		return [];
	}
	let message: string;
	if (configSetting) {
		message = 'expected final newline';
	} else {
		message = 'unexpected final newline';
	}

	const error = new EditorConfigError(message);
	error.lineNumber = document.lines.length;
	const lastLine: doc.Line = document.lines[document.lines.length - 1];
	error.columnNumber = lastLine.text.length + lastLine.ending.length;
	error.rule = 'insert_final_newline';
	error.source = lastLine.text + lastLine.ending;
	return [error];
}

function fix(settings: eclint.ISettings, document: doc.IDocument) {
	let lastLine: doc.Line;
	let ending: string;
	const configSetting = resolve(settings);
	function hasFinalNewline() {
		lastLine = document.lines[document.lines.length - 1];
		return lastLine && !lastLine.text;
	}
	if (configSetting) {
		const endOfLineSetting = settings.end_of_line || 'lf';
		ending = newlines[endOfLineSetting];
	} else {
		ending = '';
	}
	while (hasFinalNewline()) {
		document.lines.pop();
	}
	if (lastLine) {
		lastLine.ending = ending;
	} else {
		lastLine = new doc.Line({
			ending,
			number: 1,
			offset: 0,
			text: '',
		});
		document.lines.push(lastLine);
	}

	return document;
}

function infer(document: doc.IDocument) {
	const lastLine = document.lines[document.lines.length - 1];
	if (lastLine && lastLine.ending) {
		return true;
	}
	return false;
}

const InsertFinalNewlineRule: eclint.IDocumentRule = {
	check,
	fix,
	infer,
	resolve,
	type: 'DocumentRule',
};

export = InsertFinalNewlineRule;
