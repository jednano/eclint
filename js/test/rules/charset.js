var _line = require('../line');
var Charsets = _line.Charsets;
var CharsetRule = (function () {
    function CharsetRule() {
    }
    CharsetRule.prototype.check = function (context, settings, line) {
        checkByteOrderMark(context, settings, line);
        checkLatin1TextRange(context, settings, line);
    };
    CharsetRule.prototype.fix = function (settings, line) {
        var setting = settings.charset;
        if (setting) {
            line.Charsets = setting;
        }
        return line;
    };
    CharsetRule.prototype.infer = function (line) {
        return line.Charsets;
    };
    return CharsetRule;
})();
function checkByteOrderMark(context, settings, line) {
    var charset = settings.charset;
    if (line.Charsets) {
        if (charset && charset !== line.Charsets) {
            context.report('Invalid charset: ' + Charsets[line.Charsets].replace(/_/g, '-'));
        }
    }
    else if (line.Number === 1 && charset) {
        context.report('Expected charset: ' + charset);
    }
}
function checkLatin1TextRange(context, settings, line) {
    if (settings.charset !== 0 /* latin1 */) {
        return;
    }
    var text = line.Text;
    for (var i = 0, len = text.length; i < len; i++) {
        var character = text[i];
        if (character.charCodeAt(0) >= 0x80) {
            context.report('Character out of latin1 range: ' + character);
        }
    }
}
module.exports = CharsetRule;
