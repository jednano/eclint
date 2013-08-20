var newline = require('../newline');


exports.check = function(context, settings, line) {
    if (line.newline && line.newline.name !== settings.end_of_line) {
        context.report('Incorrect newline character found: ' +
            line.newline.name);
    }
};

exports.fix = function(settings, line) {
    var setting = settings.end_of_line;
    if (isSupportedSetting(setting) && line.newline) {
        line.newline.name = setting;
    }
    return line;
};

exports.infer = function(line) {
    return line.newline && line.newline.name;
};

var supportedSettings = ['lf', 'crlf', 'cr', 'ls', 'ps'];

function isSupportedSetting(setting) {
    return ~supportedSettings.indexOf(setting);
}
