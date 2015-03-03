///<reference path='../../bower_components/dt-node/node.d.ts'/>
///<reference path='../../bower_components/dt-mocha/mocha.d.ts'/>
///<reference path='../../bower_components/dt-sinon/sinon.d.ts'/>
///<reference path='../../bower_components/dt-sinon-chai/sinon-chai.d.ts'/>
var chai = require('chai');
var _sinon = require('sinon');
chai.use(require('sinon-chai'));
exports.expect = chai.expect;
exports.context = {
    report: function (message) {
    }
};
exports.reporter = _sinon.spy(exports.context, 'report');
