var common = require('./common');
var EndOfLineRule = (function () {
    function EndOfLineRule() {
    }
    EndOfLineRule.prototype.check = function (context, settings, line) {
        if (line.Newline && line.Newline.Name !== common.Newlines[settings.end_of_line]) {
            context.report('Incorrect newline character found: ' + line.Newline.Name);
        }
    };
    EndOfLineRule.prototype.fix = function (settings, line) {
        var settingName = common.Newlines[settings.end_of_line];
        if (line.Newline && settingName) {
            line.Newline.Name = settingName;
        }
        return line;
    };
    EndOfLineRule.prototype.infer = function (line) {
        return line.Newline && common.Newlines[line.Newline.Name];
    };
    return EndOfLineRule;
})();
module.exports = EndOfLineRule;
