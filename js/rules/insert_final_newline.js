var _line = require('../line');
var Newline = require('../Newline');
var InsertFinalNewlineRule = (function () {
    function InsertFinalNewlineRule() {
    }
    InsertFinalNewlineRule.prototype.check = function (context, settings, lines) {
        if (settings.insert_final_newline && !this.infer(lines)) {
            context.report('Expected final newline character');
            return;
        }
        if (settings.insert_final_newline === false && this.infer(lines)) {
            context.report('Unexpected final newline character');
        }
    };
    InsertFinalNewlineRule.prototype.fix = function (settings, lines) {
        var lastLine;
        if (settings.insert_final_newline && !this.infer(lines)) {
            lastLine = lines[lines.length - 1];
            var endOfLineSetting = settings.end_of_line || 'lf';
            if (lastLine) {
                lastLine.Newline = new Newline(Newline.map[endOfLineSetting]);
            }
            else {
                lines.push(new _line.Line('', {
                    newline: endOfLineSetting
                }));
            }
            return lines;
        }
        if (!settings.insert_final_newline) {
            while (this.infer(lines)) {
                lastLine = lines[lines.length - 1];
                if (lastLine.Text) {
                    lastLine.Newline = void (0);
                    break;
                }
                lines.pop();
            }
            return lines;
        }
        return lines;
    };
    InsertFinalNewlineRule.prototype.infer = function (lines) {
        var lastLine = lines[lines.length - 1];
        return lastLine ? !!lastLine.Newline : false;
    };
    return InsertFinalNewlineRule;
})();
module.exports = InsertFinalNewlineRule;
