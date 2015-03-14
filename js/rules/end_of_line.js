var eclint = require('../eclint');
var EndOfLineRule = (function () {
    function EndOfLineRule() {
    }
    EndOfLineRule.prototype.check = function (context, settings, line) {
        var lineEndingName = eclint.newlines[line.ending];
        if (lineEndingName && lineEndingName !== settings.end_of_line) {
            context.report('Incorrect newline character found: ' + lineEndingName);
        }
    };
    EndOfLineRule.prototype.fix = function (settings, line) {
        var settingName = settings.end_of_line;
        if (line.ending && settingName) {
            line.ending = eclint.newlines[settingName];
        }
        return line;
    };
    EndOfLineRule.prototype.infer = function (line) {
        return eclint.newlines[line.ending];
    };
    return EndOfLineRule;
})();
module.exports = EndOfLineRule;
