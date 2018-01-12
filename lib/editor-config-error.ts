import * as os from 'os';
import i18n = require('./i18n');

class EditorConfigError extends Error {
	public columnNumber ? = 1;
	public fileName ? = '<anonymous>';
	public lineNumber ? = 1;
	public message = '';
	public rule = '';
	public source = '';
	public name = 'EditorConfigError';
	/* istanbul ignore next */
	constructor(message: string, ...args) {
		super();
		this.message = i18n(message, ...args);
	}
	public inspect = function() {
		return [
			`${ this.name }: ${ this.message } (${ this.rule })`,
			`    at (${ this.fileName }:${ this.lineNumber }:${ this.columnNumber })`,
		].join(os.EOL);
	};
}

export = EditorConfigError;
