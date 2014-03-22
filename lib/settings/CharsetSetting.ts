var iconv = require('iconv-lite');
var jschardet = require('jschardet');

import Cardinality = require('../Cardinality');
import CharsetRule = require('../rules/CharsetRule');
import IHashTable = require('../interfaces/IHashTable');
import Setting = require('./Setting');


class CharsetSetting extends Setting {

	static toString() {
		return 'charset';
	}

	get rule() {
		return CharsetRule;
	}

	// ReSharper disable once InconsistentNaming
	parse(charset: any): string {
		if (iconv.encodingExists(charset)) {
			return charset;
		}
		this.warn('Unsupported charset: ' + charset);
		// ReSharper disable once NotAllPathsReturnValue
	}

	infer(contents: string): Cardinality {
		var cardinality = new Cardinality();
		cardinality.report('charset', jschardet.detect(contents).encoding);
		return cardinality;
	}

}

export = CharsetSetting;
