import IHashTable = require('../interfaces/IHashTable');
import ILogger = require('../interfaces/ILogger');
import Setting = require('./Setting');
import settings = require('./settings');


class SettingFactory {

	constructor(private logger: ILogger) {
		return;
	}

	register(setting: typeof Setting) {
		settings[Setting.toString()] = setting;
	}

	createSettings(hash: IHashTable<any>): IHashTable<Setting> {
		var result: IHashTable<Setting> = {};
		Object.keys(hash).filter(key => {
			return typeof settings[key] !== 'undefined';
		}).forEach(key => {
			var setting = new settings[key](this.logger);
			if (!(setting instanceof Setting)) {
				this.logger.error(new Error('Settings must be derived from Setting superclass'));
			}
			result[key] = setting;
		});
		return result;
	}

}

export = SettingFactory;
