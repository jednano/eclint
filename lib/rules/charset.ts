import _ = require('lodash');
import * as doc from '../doc';
import eclint = require('../eclint');
import EditorConfigError =  require('../editor-config-error');

var boms = {
	'utf-8-bom': '\u00EF\u00BB\u00BF',
	'utf-16be': '\u00FE\u00FF',
	'utf-32le': '\u00FF\u00FE\u0000\u0000',
	'utf-16le': '\u00FF\u00FE',
	'utf-32be': '\u0000\u0000\u00FE\u00FF'
};

function resolve(settings: eclint.Settings) {
	return settings.charset;
}

function check(settings: eclint.Settings, document: doc.Document) {
	function creatErrorArray(message: string, ...args) {
		var error = new EditorConfigError(message, ...args);
		var source = '';
		document.lines.some(function(line) {
			if (/\S/.test(line.text)) {
				source += line.text;
				return true;
			} else {
				source += line.text + line.ending;
			}
		});

		error.source = source;
		error.rule = 'charset';
		return [error];
	}
	var inferredSetting = infer(document);
	var configSetting = resolve(settings);
	if (inferredSetting) {
		if (inferredSetting !== settings.charset) {
			return creatErrorArray('invalid charset: %s, expected: %s', inferredSetting, configSetting);
		}
		return [];
	}
	if (configSetting === 'latin1') {
		var errors = document.lines.map(checkLatin1TextRange);
		return [].concat.apply([], errors);
	}
	if (_.includes(Object.keys(boms), configSetting)) {
		return creatErrorArray('expected charset: %s', settings.charset);
	}
	return [];
}

function fix(settings: eclint.Settings, document: doc.Document) {
	document.charset = resolve(settings);
	return document;
}

function infer(document: doc.Document): string {
	return document.charset;
}

function checkLatin1TextRange(line: doc.Line) {
	return [].slice.call(line.text, 0).map(function(character: string, i: number) {
		if (character.charCodeAt(0) >= 0x80) {
			var error = new EditorConfigError('character out of latin1 range: %s', JSON.stringify(character));
			error.lineNumber = line.number;
			error.columnNumber = i + 1;
			error.source = line.text;
			error.rule = 'charset';
			return error;
		}
	}).filter(Boolean);
}

var CharsetRule: eclint.DocumentRule = {
	type: 'DocumentRule',
	resolve: resolve,
	check: check,
	fix: fix,
	infer: infer
};

export = CharsetRule;
