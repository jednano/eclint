///<reference path='../../../vendor/dt-node/node.d.ts'/>
///<reference path='../../../vendor/dt-mocha/mocha.d.ts'/>
///<reference path='../../../vendor/dt-sinon-chai/sinon-chai.d.ts'/>
import common = require('../common');
import _line = require('../../../lib/line');
var rule = require('../../../lib/rules/indent_style');


var expect = common.expect;
var reporter = common.reporter;
var context = common.context;
var Line = _line.Line;

describe('indent_style rule', function() {

	beforeEach(function() {
		reporter.reset();
	});

	describe.skip('check command', function() {

	});

	describe.skip('fix command', function() {

	});

	describe.skip('infer command', function() {

	});

});
