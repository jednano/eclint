///<reference path="../../typings/lodash/lodash.d.ts" />
var _ = require('lodash');
var TRAILING_WHITESPACE = /[\t ]+$/;
function resolve(settings) {
    if (_.isBoolean(settings.trim_trailing_whitespace)) {
        return settings.trim_trailing_whitespace;
    }
    return void (0);
}
function check(context, settings, line) {
    var configSetting = resolve(settings);
    if (configSetting && !infer(line)) {
        context.report('Trailing whitespace found.');
    }
}
function fix(settings, line) {
    var configSetting = resolve(settings);
    if (configSetting) {
        line.text = line.text.replace(TRAILING_WHITESPACE, '');
    }
    return line;
}
function infer(line) {
    return !TRAILING_WHITESPACE.test(line.text);
}
var TrimTrailingWhitespaceRule = {
    type: 'LineRule',
    resolve: resolve,
    check: check,
    fix: fix,
    infer: infer
};
module.exports = TrimTrailingWhitespaceRule;
