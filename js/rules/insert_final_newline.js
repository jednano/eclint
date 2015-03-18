var newlines = {
    lf: '\n',
    crlf: '\r\n',
    cr: '\r'
};
var InsertFinalNewlineRule = {
    type: 'DocumentRule',
    check: function (context, settings, doc) {
        var inferredSetting = this.infer(doc);
        if (settings.insert_final_newline && !inferredSetting) {
            context.report('Expected final newline character');
            return;
        }
        if (settings.insert_final_newline === false && inferredSetting) {
            context.report('Unexpected final newline character');
        }
    },
    fix: function (settings, doc) {
        var lastLine;
        if (settings.insert_final_newline && !this.infer(doc)) {
            lastLine = doc.lines[doc.lines.length - 1];
            var endOfLineSetting = settings.end_of_line || 'lf';
            if (lastLine) {
                lastLine.ending = newlines[endOfLineSetting];
            }
            else {
                doc.lines.push({
                    number: 1,
                    text: '',
                    ending: newlines[endOfLineSetting],
                    offset: 0
                });
            }
            return doc;
        }
        if (!settings.insert_final_newline) {
            while (this.infer(doc)) {
                lastLine = doc.lines[doc.lines.length - 1];
                if (lastLine.text) {
                    lastLine.ending = void (0);
                    break;
                }
                doc.lines.pop();
            }
            return doc;
        }
        return doc;
    },
    infer: function (doc) {
        var lastLine = doc.lines[doc.lines.length - 1];
        if (lastLine && lastLine.ending) {
            return true;
        }
        return false;
    }
};
module.exports = InsertFinalNewlineRule;
