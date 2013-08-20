exports.check = function(context, settings, line) {
    if (isSettingTrue(settings) && trailingWhitespace.test(line.text)) {
        context.report('Trailing whitespace found.');
    }
};

exports.fix = function(settings, line) {
    if (isSettingTrue(settings)) {
        line.text = line.text.replace(trailingWhitespace, '');
    }
    return line;
};

exports.infer = function(line) {
    return !trailingWhitespace.test(line.text);
};

var trailingWhitespace = /\s+$/;

function isSettingTrue(settings) {
    return settings.trim_trailing_whitespace === true;
}
