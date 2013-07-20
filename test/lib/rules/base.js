var chai = require('chai');
var sinon = require('sinon');


chai.use(require('sinon-chai'));

module.exports = {
    expect: chai.expect,
    sinon: sinon,
    context: {
        report: sinon.spy()
    }
};
