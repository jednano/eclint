import osLocale = require('os-locale');
import util = require('util');
let locale;
try {
	locale = require(`../locales/${osLocale.sync()}.json`);
} catch (ex) {
	locale = require('../locales/en.json');
}

export = (str: string, ...args) => {
	return util.format(locale[str] || str, ...args);
};
