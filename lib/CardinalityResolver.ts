import ICardinality = require('interfaces/ICardinality');
import IHashTable = require('interfaces/IHashTable');


module CardinalityResolver {

	export function resolve(cardinality: ICardinality) {
		var result: IHashTable<any> = {};
		Object.keys(cardinality).forEach(key => {
			result[key] = resolveHash(cardinality[key]);
		});
		return result;
	}

	function resolveHash(hash: IHashTable<number>) {
		var result: string;
		var count = 0;
		Object.keys(hash).forEach(key => {
			var value = hash[key];
			if (value >= count) {
				count = value;
				result = key;
			}
		});
		try {
			return JSON.parse(result);
		} catch (err) {
			return result;
		}
	}

}

export = CardinalityResolver;
