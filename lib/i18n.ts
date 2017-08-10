import path = require('path');
import osLocale = require('os-locale');

const y18n = require('y18n')({
	updateFiles: false,
	directory: path.resolve(__dirname, '../locales')
});

const locale = osLocale.sync({ spawn: false });

y18n.setLocale(locale);

export = y18n.__.bind(y18n);
