import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as doc from './doc';

chai.use(sinonChai);
export let expect = chai.expect;

export function createLine(text: string, options?: {
	number?: number;
	offset?: number;
	ending?: string;
}) {
	options = options || {};
	return new doc.Line({
		ending: options.ending || '',
		number: options.number || 1,
		offset: options.offset || 0,
		text,
	});
}
