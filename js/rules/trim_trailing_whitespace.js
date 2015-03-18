var TRAILING_WHITESPACE = /[\t ]+$/;
var TrimTrailingWhitespaceRule = {
    type: 'LineRule',
    check: function (context, settings, line) {
        if (isSettingTrue(settings) && !this.infer(line)) {
            context.report('Trailing whitespace found.');
        }
    },
    fix: function (settings, line) {
        if (isSettingTrue(settings)) {
            line.text = line.text.replace(TRAILING_WHITESPACE, '');
        }
        return line;
    },
    infer: function (line) {
        return !TRAILING_WHITESPACE.test(line.text);
    }
};
function isSettingTrue(settings) {
    return settings.trim_trailing_whitespace;
}
module.exports = TrimTrailingWhitespaceRule;
