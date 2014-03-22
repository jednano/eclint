import linez = require('linez');

import Cardinality = require('../Cardinality');
import IHashTable = require('../interfaces/IHashTable');
import ILogger = require('../interfaces/ILogger');
import SettingProvider = require('../settings/SettingProvider');


class Rule {

	settings: IHashTable<any>;

	constructor(settingProvider: SettingProvider, public logger: ILogger) {
		this.settings = settingProvider.get(this.needs);
	}

	get needs(): string[] {
		return [];
	}

	check(doc: linez.Document): void {
		throw new Error('Extenders of Rule must implement check method');
	}

	fix(doc: linez.Document): linez.Document {
		throw new Error('Extenders of Rule must implement fix method');
	}

	infer(doc: linez.Document): Cardinality {
		throw new Error('Extenders of Rule must implement infer method');
	}

}

export = Rule;
