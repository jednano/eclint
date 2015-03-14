///<reference path='../typings/tsd.d.ts'/>

import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

chai.use(sinonChai);
export var expect = chai.expect;

// ReSharper disable once DeclarationHides
export var context = {
	// ReSharper disable once UnusedParameter
	report: (message: string) => {
		// noop
	}
};

export var reporter = sinon.spy(context, 'report');

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
