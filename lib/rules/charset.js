exports = {

    check: function(context, settings, line) {
        checkByteOrderMark(context, settings, line);
        checkLatin1TextRange(context, settings, line);
    },

    fix: function(settings, line) {
        var setting = settings.charset;
        if (setting) {
            line.charset = setting;
        }
        return line;
    },

    infer: function(line) {
        return line.charset;
    }

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
    for (var i = 0, len = line.length; i < len; i++) {
        if (line.charCodeAt(i) >= 0x80) {
            context.report('Character out of latin1 range: ' + line[i]);
        }
    }
}
