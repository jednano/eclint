var TRAILING_WHITESPACE = /[\t ]+$/;
function check(context, settings, line) {
    if (isSettingTrue(settings) && !infer(line)) {
        context.report('Trailing whitespace found.');
    }
}
function fix(settings, line) {
    if (isSettingTrue(settings)) {
        line.text = line.text.replace(TRAILING_WHITESPACE, '');
    }
    return line;
}
function infer(line) {
    return !TRAILING_WHITESPACE.test(line.text);
}
function isSettingTrue(settings) {
    return settings.trim_trailing_whitespace;
}
var TrimTrailingWhitespaceRule = {
    type: 'LineRule',
    check: check,
    fix: fix,
    infer: infer
};
module.exports = TrimTrailingWhitespaceRule;
