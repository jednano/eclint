///<reference path='../../vendor/dt-node/node.d.ts'/>
///<reference path='../../vendor/dt-chai/chai.d.ts'/>
///<reference path='../../vendor/dt-sinon/sinon.d.ts'/>
var chai = require('chai');
var sinon = require('sinon');


chai.use(require('sinon-chai'));

export var context = {
	report: (message: string) => { }
};

export var expect: chai.ExpectStatic = chai.expect;
export var reporter: SinonSpy = sinon.spy(context, 'report');
