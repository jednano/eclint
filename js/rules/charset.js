///<reference path='../../typings/lodash/lodash.d.ts'/>
var _ = require('lodash');
var boms = {
    'utf-8-bom': '\u00EF\u00BB\u00BF',
    'utf-16be': '\u00FE\u00FF',
    'utf-32le': '\u00FF\u00FE\u0000\u0000',
    'utf-16le': '\u00FF\u00FE',
    'utf-32be': '\u0000\u0000\u00FE\u00FF'
};
var CharsetRule = {
    type: 'DocumentRule',
    check: function (context, settings, doc) {
        var inferredSetting = this.infer(doc);
        if (inferredSetting) {
            if (inferredSetting !== settings.charset) {
                context.report('Invalid charset: ' + inferredSetting);
            }
            return;
        }
        if (settings.charset === 'latin1') {
            checkLatin1TextRange(context, settings, doc.lines[0]);
            return;
        }
        if (_.contains(Object.keys(boms), settings.charset)) {
            context.report('Expected charset: ' + settings.charset);
        }
    },
    fix: function (settings, doc) {
        doc.charset = settings.charset;
        return doc;
    },
    infer: function (doc) {
        return doc.charset;
    }
};
function checkLatin1TextRange(context, settings, line) {
    var text = line.text;
    for (var i = 0, len = text.length; i < len; i++) {
        var character = text[i];
        if (character.charCodeAt(0) >= 0x80) {
            context.report('Character out of latin1 range: ' + character);
        }
    }
}
module.exports = CharsetRule;
