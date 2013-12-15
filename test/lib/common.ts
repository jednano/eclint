///<reference path='../../vendor/dt-sinon/sinon.d.ts'/>
///<reference path='../../vendor/dt-sinon-chai/sinon-chai.d.ts'/>
var chai: SinonChaiStatic = require('chai');
import sinon = require('sinon');

chai.use(require('sinon-chai'));

export var context = {
	report: (message: string) => {}
};

export var expect = chai.expect;
export var reporter: SinonSpy = sinon.spy(context, 'report');
