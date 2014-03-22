import InsertFinalNewlineRule = require('../rules/InsertFinalNewlineRule');
import Setting = require('./Setting');


class InsertFinalNewlineSetting extends Setting {

	static toString() {
		return 'insert_final_newline';
	}

	get rule() {
		return InsertFinalNewlineRule;
	}

	parse(insertFinalNewline: any): boolean {
		return !!insertFinalNewline;
	}

}

export = InsertFinalNewlineSetting;
