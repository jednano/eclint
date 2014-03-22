import IFoundString = require('interfaces/IFoundString');


class StringFinder {

	private _re: RegExp;

	constructor(needles: any) {
		if (needles instanceof RegExp) {
			this._re = needles;
		} else if (needles instanceof Array) {
			this._re = this.convertToPipedExpression(needles);
		} else {
			throw new Error('StringFinder constructor takes a string[] or RegExp');
		}
	}

	private convertToPipedExpression(needles: string[]) {
		needles = needles.map(needle => {
			return '\\' + needle.split('').join('\\');
		});
		var result = new RegExp('(' + needles.join('|') + ')', 'g');
		return result;
	}

	findAll(haystack: string) {
		var matches: IFoundString[] = [];
		var match;
		while (match = this._re.exec(haystack)) {
			matches.push({
				index: match.index,
				text: match[0]
			});
		}
		return matches;
	}
}

export = StringFinder;
