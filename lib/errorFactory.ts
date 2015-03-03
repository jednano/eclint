var util = require('util');

export interface ErrorOptions {
	name: string;
}

export function create(options: ErrorOptions) {
	function Err(message: string) {
		this.message = message;
	}
	util.inherits(Err, Error);
	Err.prototype.name = options.name;
	return Err;
}
