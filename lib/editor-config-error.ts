import os = require('os');
import i18n = require('./i18n');

class EditorConfigError extends Error {
	fileName? = '<anonymous>';
	lineNumber? = 1;
	columnNumber? = 1;
	message = '';
	rule = '';
	source = '';
	name = 'EditorConfigError';
	inspect = function() {
		return [
			`${ this.name }: ${ this.message } (${ this.rule })`,
			`    at (${ this.fileName }:${ this.lineNumber }:${ this.columnNumber })`
		].join(os.EOL);
	};
	constructor(message: any[]) {
		super();
		this.message = i18n(...message);
	}
}

export = EditorConfigError;
