///<reference path='../../typings/lodash/lodash.d.ts'/>
var _ = require('lodash');
var boms = {
    'utf-8-bom': '\u00EF\u00BB\u00BF',
    'utf-16be': '\u00FE\u00FF',
    'utf-32le': '\u00FF\u00FE\u0000\u0000',
    'utf-16le': '\u00FF\u00FE',
    'utf-32be': '\u0000\u0000\u00FE\u00FF'
};
function resolve(settings) {
    return settings.charset;
}
function check(context, settings, doc) {
    var inferredSetting = infer(doc);
    var configSetting = resolve(settings);
    if (inferredSetting) {
        if (inferredSetting !== settings.charset) {
            context.report('invalid charset: ' + inferredSetting + ', expected: ' + configSetting);
        }
        return;
    }
    if (configSetting === 'latin1') {
        checkLatin1TextRange(context, settings, doc.lines[0]);
        return;
    }
    if (_.contains(Object.keys(boms), configSetting)) {
        context.report('expected charset: ' + settings.charset);
    }
}
function fix(settings, doc) {
    doc.charset = resolve(settings);
    return doc;
}
function infer(doc) {
    return doc.charset;
}
function checkLatin1TextRange(context, settings, line) {
    var text = line.text;
    for (var i = 0, len = text.length; i < len; i++) {
        var character = text[i];
        if (character.charCodeAt(0) >= 0x80) {
            context.report([
                'line ' + line.number + ',',
                'column: ' + (i + 1) + ':',
                'character out of latin1 range: ' + character
            ].join(' '));
        }
    }
}
var CharsetRule = {
    type: 'DocumentRule',
    resolve: resolve,
    check: check,
    fix: fix,
    infer: infer
};
module.exports = CharsetRule;
