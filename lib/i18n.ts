import * as osLocale from 'os-locale';
import * as util from 'util';
let locale;
/* tslint:disable:no-var-requires */
try {
	locale = require(`../locales/${osLocale.sync()}.json`);
} catch (ex) {
	locale = require('../locales/en.json');
}
/* tslint:enable:no-var-requires */
export = (str: string, ...args) => {
	return util.format(locale[str] || str, ...args);
};
