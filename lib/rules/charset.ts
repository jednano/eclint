exports.check = function(context, settings, line) {
    checkByteOrderMark(context, settings, line);
    checkLatin1TextRange(context, settings, line);
};

exports.fix = function(settings, line) {
    var setting = settings.charset;
    if (setting) {
        line.charset = setting;
    }
    return line;
};

exports.infer = function(line) {
    return line.charset;
};

function checkByteOrderMark(context, settings, line) {
    var charset = settings.charset;
    if (line.charset) {
        if (charset && charset !== line.charset) {
            context.report('Invalid charset: ' + line.charset);
        }
    } else if (line.number === 1 && charset) {
        context.report('Expected charset: ' + charset);
    }
}

function checkLatin1TextRange(context, settings, line) {
    if (settings.charset !== 'latin1') {
        return;
    }
    var text = line.text;
    for (var i = 0, len = text.length; i < len; i++) {
        var character = text[i];
        if (character.charCodeAt(0) >= 0x80) {
            context.report('Character out of latin1 range: ' + character);
        }
    }
}
