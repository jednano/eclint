import IHashTable = require('interfaces/IHashTable');


class Cardinality {

	private hash: IHashTable<IHashTable<number>> = {};

	report(key: string, value: any) {
		var item = this.hash[key] = this.hash[key] || {};
		item[value] = (item[value] || 0) + 1;
	}

	resolve(key: string) {
		var item = this.hash[key];
		var max = 0;
		var result: string;
		Object.keys(item).forEach(k => {
			var value = item[k];
			if (value >= max) {
				max = value;
				result = k;
			}
		});
		return this.tryDataConversion(result);
	}

	private tryDataConversion(input: string) {
		try {
			return JSON.parse(input.toLowerCase());
		} catch (err) {
			return input;
		}
	}

}

export = Cardinality;
