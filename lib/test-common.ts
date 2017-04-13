import chai = require('chai');
import sinonChai = require('sinon-chai');
import doc = require('./doc');

chai.use(sinonChai);
export var expect = chai.expect;

export function createLine(text: string, options?: {
	number?: number;
	offset?: number;
	ending?: string;
}) {
	options = options || {};
	return new doc.Line({
		number: options.number || 1,
		offset: options.offset || 0,
		text: text,
		ending: options.ending || ''
	});
}
