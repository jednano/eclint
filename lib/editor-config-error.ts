import os = require('os');

class EditorConfigError extends Error {
	fileName = '<anonymous>';
	lineNumber = 1;
	columnNumber = 1;
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

	constructor(message: string) {
		super();
		this.message = message;
	};
}

export = EditorConfigError;
