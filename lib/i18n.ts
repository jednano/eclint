import path = require('path');
import osLocale = require('os-locale');

const y18n = require('y18n')({
	directory: path.resolve(__dirname, '../locales')
});

try {
	y18n.setLocale(osLocale.sync({ spawn: false }));
} catch (err) {
	// if we explode looking up locale just noop
	// we'll keep using the default language 'en'.
}

export = y18n.__.bind(y18n);
