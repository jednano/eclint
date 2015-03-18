var newlines = {
    lf: '\n',
    '\n': 'lf',
    crlf: '\r\n',
    '\r\n': 'crlf',
    cr: '\r',
    '\r': 'cr'
};
var EndOfLineRule = {
    type: 'LineRule',
    check: function (context, settings, line) {
        if (!settings.end_of_line) {
            return;
        }
        var inferredSetting = this.infer(line);
        if (inferredSetting !== settings.end_of_line) {
            context.report('Incorrect newline character found: ' + inferredSetting);
        }
    },
    fix: function (settings, line) {
        var settingName = settings.end_of_line;
        if (line.ending && settingName) {
            line.ending = newlines[settingName];
        }
        return line;
    },
    infer: function (line) {
        return newlines[line.ending];
    }
};
module.exports = EndOfLineRule;
