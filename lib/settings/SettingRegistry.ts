import Setting = require('./Setting');


class SettingRegistry {

	private _settings: Array<typeof Setting> = [];
	public get settings() {
		return this._settings;
	}

	add(type: typeof Setting) {
		if (this.settingExists(type)) {
			throw new Error('Setting "' + type.toString() + '" already exists');
		}
		this._settings.push(type);
	}

	private settingExists(type: typeof Setting) {
		return this._settings.some(cls => {
			return cls === type;
		});
	}

}

export = SettingRegistry;
