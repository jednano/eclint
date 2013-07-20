var chai = require('chai');
var sinon = require('sinon');


chai.use(require('sinon-chai'));

var context = {
    report: function() {
    }
};

global.expect = chai.expect;
global.context = context;
global.reporter = sinon.spy(context, 'report');
