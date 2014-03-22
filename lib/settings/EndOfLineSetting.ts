import EndOfLineRule = require('../rules/EndOfLineRule');
import Setting = require('./Setting');


class EndOfLineSetting extends Setting {

	static toString() {
		return 'end_of_line';
	}

	get rule() {
		return EndOfLineRule;
	}

	// ReSharper disable once InconsistentNaming
	parse(EOL: any): string {
		switch (EOL) {
			case 'lf':
			case 'crlf':
				return EOL;
			default:
				this.warn('Unsupported end_of_line: ' + EOL);
		}
		// ReSharper disable once NotAllPathsReturnValue
	}

}

export = EndOfLineSetting;
