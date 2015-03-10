var CharsetRule = (function () {
    function CharsetRule() {
    }
    CharsetRule.prototype.check = function (context, settings, lines) {
        var firstLine = lines[0];
        if (!firstLine) {
            return;
        }
        checkByteOrderMark(context, settings, firstLine);
        checkLatin1TextRange(context, settings, firstLine);
    };
    CharsetRule.prototype.fix = function (settings, lines) {
        var firstLine = lines[0];
        if (!firstLine || firstLine.Number !== 1) {
            return lines;
        }
        var setting = settings.charset;
        if (setting) {
            firstLine.Charsets = setting;
        }
        return lines;
    };
    CharsetRule.prototype.infer = function (lines) {
        var firstLine = lines[0];
        return firstLine && firstLine.Charsets;
    };
    return CharsetRule;
})();
function checkByteOrderMark(context, settings, line) {
    var charset = settings.charset;
    if (line.Charsets) {
        if (charset && charset !== line.Charsets) {
            context.report('Invalid charset: ' + line.Charsets.replace(/_/g, '-'));
        }
    }
    else if (line.Number === 1 && charset) {
        context.report('Expected charset: ' + charset);
    }
}
function checkLatin1TextRange(context, settings, line) {
    if (settings.charset !== 'latin1') {
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
