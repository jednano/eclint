import fs = require('fs');
import path = require('path');
import osLocale = require('os-locale');

const y18n = require('y18n')({
	directory: path.resolve(__dirname, '../locales')
});

const locale = osLocale.sync({ spawn: false })

// bugfix for yargs/y18n#48
if (fs.existsSync(path.join(y18n.directory, locale + '.json'))) {
	y18n.setLocale(locale);
}

export = y18n.__.bind(y18n);
