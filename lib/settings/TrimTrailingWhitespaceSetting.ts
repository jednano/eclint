import Setting = require('./Setting');
import TrimTrailingWhitespaceRule = require('../rules/TrimTrailingWhitespaceRule');


class TrimTrailingWhitespaceSetting extends Setting {

	static toString() {
		return 'trim_trailing_whitespace';
	}

	get rule() {
		return TrimTrailingWhitespaceRule;
	}

	parse(trimTrailingWhitespace: any): boolean {
		return !!trimTrailingWhitespace;
	}

}

export = TrimTrailingWhitespaceSetting;
