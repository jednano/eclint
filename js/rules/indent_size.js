///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
var _ = require('lodash');
function resolve(settings) {
    var result = (settings.indent_size === 'tab') ? settings.tab_width : settings.indent_size;
    if (!_.isNumber(result)) {
        result = settings.tab_width;
    }
    return _.isNumber(result) ? result : void (0);
}
function check(context, settings, line) {
    if (settings.indent_style === 'tab') {
        return;
    }
    var configSetting = resolve(settings);
    if (_.isUndefined(configSetting)) {
        return;
    }
    var inferredSetting = infer(line);
    if (_.isUndefined(inferredSetting)) {
        return;
    }
    if (inferredSetting % configSetting !== 0) {
        context.report([
            'line ' + line.number + ':',
            'invalid indent size: ' + inferredSetting + ',',
            'expected: ' + configSetting
        ].join(' '));
    }
}
function fix(settings, line) {
    return line; // noop
}
function infer(line) {
    if (line.text[0] === '\t') {
        return void (0);
    }
    var m = line.text.match(/^ +/);
    if (m) {
        var leadingSpacesLength = m[0].length;
        for (var i = 8; i > 0; i--) {
            if (leadingSpacesLength % i === 0) {
                return i;
            }
        }
    }
    return 0;
}
var IndentSizeRule = {
    type: 'LineRule',
    resolve: resolve,
    check: check,
    fix: fix,
    infer: infer
};
module.exports = IndentSizeRule;
