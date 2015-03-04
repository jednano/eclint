var TabWidthRule = (function () {
    function TabWidthRule() {
    }
    TabWidthRule.prototype.check = function (context, settings, line) {
        return;
    };
    TabWidthRule.prototype.fix = function (settings, line) {
        return line;
    };
    TabWidthRule.prototype.infer = function (line) {
        throw new Error('Tab width cannot be inferred');
    };
    return TabWidthRule;
})();
module.exports = TabWidthRule;
