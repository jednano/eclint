import ILogger = require('../interfaces/ILogger');
import Rule = require('../rules/Rule');


class Setting {

	constructor(private logger: ILogger) {
		return;
	}

	get ruleClass(): typeof Rule {
		throw new Error('Extenders of Setting must implement rule property');
	}

	parse(settingValue: any): any {
		throw new Error('Extenders of Setting must implement parse method');
	}

	info(message: string) {
		this.logger.info(message);
	}

	debug(message: string) {
		this.logger.debug(message);
	}

	warn(message: string) {
		this.logger.warn(message);
	}

}

export = Setting;
