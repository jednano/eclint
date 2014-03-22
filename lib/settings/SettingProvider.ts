import IHashTable = require('../interfaces/IHashTable');
import Setting = require('./Setting');
import settings = require('./settings');


class SettingProvider {

	private parsedSettings: IHashTable<any> = {};

	constructor(private hash: IHashTable<any>, private settings: IHashTable<Setting>) {
		this.parseSettings(hash, settings);
	}

	private parseSettings(hash: IHashTable<any>, settings: IHashTable<Setting>) {
		Object.keys(settings).forEach(key => {
			var setting = settings[key];
			this.parsedSettings[key] = setting.parse(hash[key]);
		});
	}

	get(settings: string[]): IHashTable<any> {
		var result: IHashTable<any> = {};
		settings.forEach(key => {
			result[key] = this.parsedSettings[key];
		});
		return result;
	}

}

export = SettingProvider;
