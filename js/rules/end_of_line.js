var newlines = {
    lf: '\n',
    '\n': 'lf',
    crlf: '\r\n',
    '\r\n': 'crlf',
    cr: '\r',
    '\r': 'cr'
};
function check(context, settings, line) {
    if (!settings.end_of_line) {
        return;
    }
    var inferredSetting = infer(line);
    if (!inferredSetting) {
        return;
    }
    if (inferredSetting !== settings.end_of_line) {
        context.report('Incorrect newline character found: ' + inferredSetting);
    }
}
function fix(settings, line) {
    var settingName = settings.end_of_line;
    if (line.ending && settingName) {
        line.ending = newlines[settingName];
    }
    return line;
}
function infer(line) {
    return newlines[line.ending];
}
var EndOfLineRule = {
    type: 'LineRule',
    check: check,
    fix: fix,
    infer: infer
};
module.exports = EndOfLineRule;
