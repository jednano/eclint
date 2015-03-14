///<reference path='../typings/tsd.d.ts'/>
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
exports.expect = chai.expect;
// ReSharper disable once DeclarationHides
exports.context = {
    // ReSharper disable once UnusedParameter
    report: function (message) {
        // noop
    }
};
exports.reporter = sinon.spy(exports.context, 'report');
function createLine(text, options) {
    options = options || {};
    return {
        number: options.number || 1,
        offset: options.offset || 0,
        text: text,
        ending: options.ending || ''
    };
}
exports.createLine = createLine;
