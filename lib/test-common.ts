///<reference path='../bower_components/dt-node/node.d.ts'/>
///<reference path='../bower_components/dt-mocha/mocha.d.ts'/>
///<reference path='../bower_components/dt-sinon/sinon.d.ts'/>
///<reference path='../bower_components/dt-sinon-chai/sinon-chai.d.ts'/>
var chai: SinonChaiStatic = require('chai');
import _sinon = require('sinon');
chai.use(require('sinon-chai'));
export var expect = chai.expect;

export var context = {
	report: (message: string) => {
		// noop
	}
};

export var reporter: SinonSpy = _sinon.spy(context, 'report');
