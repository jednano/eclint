import chai = require('chai');
// import sinon = require('sinon');
import sinonChai = require('sinon-chai');

chai.use(sinonChai);
export var expect = chai.expect;

export function createLine(text: string, options?: {
	number?: number;
	offset?: number;
	ending?: string;
}) {
	options = options || {};
	return {
		number: options.number || 1,
		offset: options.offset || 0,
		text: text,
		ending: options.ending || ''
	};
}
