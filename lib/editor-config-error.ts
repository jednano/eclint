class EditorConfigError extends Error {
	fileName: string = '<anonymous>';
	lineNumber: number = 1;
	columnNumber: number = 1;
	message: string = '';
	rule: string = '';
	source: string = '';
	name: string = 'EditorConfigError';

	constructor(message: string) {
		super();
		this.message = message;
	}
	toString() {
		return `line ${ this.lineNumber }, column: ${ this.columnNumber }: ${ this.message }`;
	}
	inspect() {
		return [
			`${ this.message } (${ this.rule })`,
			`    at (${ this.fileName }:${ this.lineNumber }:${ this.columnNumber })`
		].join('\n');
	}
}

export = EditorConfigError;
