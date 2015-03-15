///<reference path='../../typings/lodash/lodash.d.ts'/>
var _ = require('lodash');
var eclint = require('../eclint');
var boms = eclint.boms;
var CharsetRule = {
    type: 'DocumentRule',
    check: function (context, settings, doc) {
        var detectedCharset = doc.charset;
        if (detectedCharset) {
            if (detectedCharset !== settings.charset) {
                context.report('Invalid charset: ' + detectedCharset);
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
