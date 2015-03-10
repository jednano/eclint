var TRAILING_WHITESPACE = /[\t ]+$/;
var TrimTrailingWhitespaceRule = (function () {
    function TrimTrailingWhitespaceRule() {
    }
    TrimTrailingWhitespaceRule.prototype.check = function (context, settings, line) {
        if (isSettingTrue(settings) && TRAILING_WHITESPACE.test(line.Text)) {
            context.report('Trailing whitespace found.');
        }
    };
    TrimTrailingWhitespaceRule.prototype.fix = function (settings, line) {
        if (isSettingTrue(settings)) {
            line.Text = line.Text.replace(TRAILING_WHITESPACE, '');
        }
        return line;
    };
    TrimTrailingWhitespaceRule.prototype.infer = function (line) {
        return !TRAILING_WHITESPACE.test(line.Text);
    };
    return TrimTrailingWhitespaceRule;
})();
function isSettingTrue(settings) {
    return settings.trim_trailing_whitespace;
}
module.exports = TrimTrailingWhitespaceRule;
