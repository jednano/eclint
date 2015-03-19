var newlines = {
    lf: '\n',
    crlf: '\r\n',
    cr: '\r'
};
function parse(insertFinalNewline) {
    switch (insertFinalNewline) {
        case true:
        case false:
            return insertFinalNewline;
        default:
            return void (0);
    }
}
function check(context, settings, doc) {
    var setting = parse(settings.insert_final_newline);
    var inferredSetting = infer(doc);
    if (setting === true && !inferredSetting) {
        context.report('Expected final newline character');
        return;
    }
    if (setting === false && inferredSetting) {
        context.report('Unexpected final newline character');
    }
}
function fix(settings, doc) {
    var lastLine;
    if (settings.insert_final_newline && !infer(doc)) {
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
        while (infer(doc)) {
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
}
function infer(doc) {
    var lastLine = doc.lines[doc.lines.length - 1];
    if (lastLine && lastLine.ending) {
        return true;
    }
    return false;
}
var InsertFinalNewlineRule = {
    type: 'DocumentRule',
    parse: parse,
    check: check,
    fix: fix,
    infer: infer
};
module.exports = InsertFinalNewlineRule;
