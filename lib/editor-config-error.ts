class EditorConfigError extends Error {
	fileName: string;
	lineNumber: number = 1;
	columnNumber: number = 1;
	message: string;
	rule: string;
	source: string;
	name: string = 'EditorConfigError';

	constructor(message: string) {
		super();
		this.message = message;
	}
}

export = EditorConfigError;
