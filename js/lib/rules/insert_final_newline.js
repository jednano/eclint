var _line = require('../line');
var common = require('./common');
var InsertFinalNewlineRule = (function () {
    function InsertFinalNewlineRule() {
    }
    InsertFinalNewlineRule.prototype.check = function (context, settings, lines) {
        if (this.infer(lines)) {
            if (!settings.insert_final_newline) {
                context.report('Expected final newline character');
            }
        }
        else if (settings.insert_final_newline) {
            context.report('Unexpected final newline character');
        }
    };
    InsertFinalNewlineRule.prototype.fix = function (settings, lines) {
        if (this.infer(lines)) {
            if (!settings.insert_final_newline) {
                lines.push(new _line.Line('', {
                    newline: common.Newlines[common.Newlines[settings.end_of_line]]
                }));
            }
        }
        else if (settings.insert_final_newline) {
            lines.pop();
        }
        return lines;
    };
    InsertFinalNewlineRule.prototype.infer = function (lines) {
        var lastLine = lines[lines.length - 1];
        if (lastLine.Text === '' && lastLine.Newline.Length === 0) {
            return true;
        }
        return false;
    };
    return InsertFinalNewlineRule;
})();
module.exports = InsertFinalNewlineRule;
