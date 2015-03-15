var eclint = require('../eclint');
var EndOfLineRule = {
    type: 'LineRule',
    check: function (context, settings, line) {
        var lineEndingName = eclint.newlines[line.ending];
        if (lineEndingName && lineEndingName !== settings.end_of_line) {
            context.report('Incorrect newline character found: ' + lineEndingName);
        }
    },
    fix: function (settings, line) {
        var settingName = settings.end_of_line;
        if (line.ending && settingName) {
            line.ending = eclint.newlines[settingName];
        }
        return line;
    },
    infer: function (line) {
        return eclint.newlines[line.ending];
    }
};
module.exports = EndOfLineRule;
