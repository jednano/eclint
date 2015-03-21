///<reference path="../../typings/lodash/lodash.d.ts" />
var _ = require('lodash');
var newlines = {
    lf: '\n',
    crlf: '\r\n',
    cr: '\r'
};
function resolve(settings) {
    if (_.isBoolean(settings.insert_final_newline)) {
        return settings.insert_final_newline;
    }
    return void (0);
}
function check(context, settings, doc) {
    var configSetting = resolve(settings);
    var inferredSetting = infer(doc);
    if (configSetting && !inferredSetting) {
        context.report('Expected final newline character');
        return;
    }
    if (configSetting === false && inferredSetting) {
        context.report('Unexpected final newline character');
    }
}
function fix(settings, doc) {
    var lastLine;
    var configSetting = resolve(settings);
    if (configSetting && !infer(doc)) {
        lastLine = doc.lines[doc.lines.length - 1];
        var endOfLineSetting = settings.end_of_line || 'lf';
        if (lastLine) {
            lastLine.ending = newlines[endOfLineSetting];
        }
        else {
            doc.lines.push({
                number: 1,
                text: '',
                ending: newlines[endOfLineSetting],
                offset: 0
            });
        }
        return doc;
    }
    if (!configSetting) {
        while (infer(doc)) {
            lastLine = doc.lines[doc.lines.length - 1];
            if (lastLine.text) {
                lastLine.ending = void (0);
                break;
            }
            doc.lines.pop();
        }
        return doc;
    }
    return doc;
}
function infer(doc) {
    var lastLine = doc.lines[doc.lines.length - 1];
    if (lastLine && lastLine.ending) {
        return true;
    }
    return false;
}
var InsertFinalNewlineRule = {
    type: 'DocumentRule',
    resolve: resolve,
    check: check,
    fix: fix,
    infer: infer
};
module.exports = InsertFinalNewlineRule;
