function check(context, settings, line) {
    if (isSettingTrue(settings) && trailingWhitespace.test(line.Text)) {
        context.report('Trailing whitespace found.');
    }
}
exports.check = check;
function fix(settings, line) {
    if (isSettingTrue(settings)) {
        line.Text = line.Text.replace(trailingWhitespace, '');
    }
    return line;
}
exports.fix = fix;
function infer(line) {
    return !trailingWhitespace.test(line.Text);
}
exports.infer = infer;
var trailingWhitespace = /\s+$/;
function isSettingTrue(settings) {
    return settings.trim_trailing_whitespace === true;
}
