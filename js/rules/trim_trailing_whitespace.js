var TRAILING_WHITESPACE = /[\t ]+$/;
var TrimTrailingWhitespaceRule = (function () {
    function TrimTrailingWhitespaceRule() {
    }
    TrimTrailingWhitespaceRule.prototype.check = function (context, settings, line) {
        if (isSettingTrue(settings) && TRAILING_WHITESPACE.test(line.text)) {
            context.report('Trailing whitespace found.');
        }
    };
    TrimTrailingWhitespaceRule.prototype.fix = function (settings, line) {
        if (isSettingTrue(settings)) {
            line.text = line.text.replace(TRAILING_WHITESPACE, '');
        }
        return line;
    };
    TrimTrailingWhitespaceRule.prototype.infer = function (line) {
        return !TRAILING_WHITESPACE.test(line.text);
    };
    return TrimTrailingWhitespaceRule;
})();
function isSettingTrue(settings) {
    return settings.trim_trailing_whitespace;
}
module.exports = TrimTrailingWhitespaceRule;
