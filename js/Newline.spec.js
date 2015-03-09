var common = require('./test-common');
var Newline = require('./Newline');
var expect = common.expect;
var newlines = {
    lf: '\n',
    crlf: '\r\n',
    cr: '\r',
    vt: '\u000B',
    ff: '\u000C',
    nel: '\u0085',
    ls: '\u2028',
    ps: '\u2029'
};
// ReSharper disable WrongExpressionStatement
describe('Newline class', function () {
    Object.keys(newlines).forEach(function (key) {
        it('supports ' + key + ' newline character', function () {
            var fn = function () {
                return new Newline(newlines[key]);
            };
            expect(fn).not.to.throw;
        });
    });
    it('errors on invalid or unsupported newline characters', function () {
        var fn = function () {
            return new Newline('foo');
        };
        expect(fn).to.throw('Invalid or unsupported newline character');
    });
});
