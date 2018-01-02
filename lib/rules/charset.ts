import * as _ from 'lodash';
import * as doc from '../doc';
import * as eclint from '../eclint';
import EditorConfigError = require('../editor-config-error');

const boms = {
	'utf-16be': '\u00FE\u00FF',
	'utf-16le': '\u00FF\u00FE',
	'utf-32be': '\u0000\u0000\u00FE\u00FF',
	'utf-32le': '\u00FF\u00FE\u0000\u0000',
	'utf-8-bom': '\u00EF\u00BB\u00BF',
};

function resolve(settings: eclint.ISettings) {
	return settings.charset;
}

function check(settings: eclint.ISettings, document: doc.IDocument) {
	function creatErrorArray(message: string, ...args) {
		const error = new EditorConfigError(message, ...args);
		let source = '';
		document.lines.some((line) => {
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
	const inferredSetting = infer(document);
	const configSetting = resolve(settings);
	if (inferredSetting) {
		if (inferredSetting !== settings.charset) {
			return creatErrorArray('invalid charset: %s, expected: %s', inferredSetting, configSetting);
		}
		return [];
	}
	if (configSetting === 'latin1') {
		const errors = document.lines.map(checkLatin1TextRange);
		return [].concat.apply([], errors);
	}
	if (_.includes(Object.keys(boms), configSetting)) {
		return creatErrorArray('expected charset: %s', settings.charset);
	}
	return [];
}

function fix(settings: eclint.ISettings, document: doc.IDocument) {
	document.charset = resolve(settings);
	return document;
}

function infer(document: doc.IDocument): string {
	return document.charset;
}

function checkLatin1TextRange(line: doc.Line) {
	return [].slice.call(line.text, 0).map((character: string, i: number) => {
		if (character.charCodeAt(0) >= 0x80) {
			const error = new EditorConfigError('character out of latin1 range: %s', JSON.stringify(character));
			error.lineNumber = line.number;
			error.columnNumber = i + 1;
			error.source = line.text;
			error.rule = 'charset';
			return error;
		}
	}).filter(Boolean);
}

const CharsetRule: eclint.IDocumentRule = {
	check,
	fix,
	infer,
	resolve,
	type: 'DocumentRule',
};

export = CharsetRule;
