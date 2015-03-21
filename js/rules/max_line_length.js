///<reference path="../../typings/lodash/lodash.d.ts" />
var _ = require('lodash');
function resolve(settings) {
    return _.isNumber(settings.max_line_length) ? settings.max_line_length : void (0);
}
function check(context, settings, line) {
    var inferredSetting = infer(line);
    var configSetting = resolve(settings);
    if (inferredSetting > settings.max_line_length) {
        context.report([
            'Line length ' + inferredSetting + ' exceeds max_line_length',
            'setting of ' + configSetting,
            'on line number ' + line.number
        ].join(' '));
    }
}
function fix(settings, line) {
    return line; // noop
}
function infer(line) {
    return line.text.length;
}
var MaxLineLengthRule = {
    type: 'LineRule',
    resolve: resolve,
    check: check,
    fix: fix,
    infer: infer
};
module.exports = MaxLineLengthRule;
