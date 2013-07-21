var map = {
    // CR+LF: CR (U+000D) followed by LF (U+000A)
    crlf: '\r\n',

    // LF: Line Feed, U+000A
    lf: '\n',

    // CR: Carriage Return, U+000D
    cr: '\r',

    // VT: Vertical Tab, U+000B
    vt: '\u000B',

    // FF: Form Feed, U+000C
    ff: '\u000C',

    // NEL: Next Line, U+0085
    nel: '\u0085',

    // LS: Line Separator, U+2028
    ls: '\u2028',

    // PS: Paragraph Separator, U+2029
    ps: '\u2029'
};

var reverseMap = {};

var newlineCharacters = Object.keys(map).map(function(key) {
    var value = map[key];
    reverseMap[value] = key;
    return value;
});

var newlineCharacterPat = new RegExp(
    '(' + newlineCharacters.join('|') + ')', 'g');


exports.check = function(context, setting, data) {
    var matches = data.match(newlineCharacterPat);
    matches && matches.forEach(function(match) {
        if (match !== setting) {
            context.report('Incorrect line ending found: ' + reverseMap[match]);
        }
    });
};

exports.fix = function(setting, data) {
    return data.replace(newlineCharacterPat, function() {
        return setting;
    });
};

exports.infer = function(data) {
    var inferred = {};
    var matches = data.match(newlineCharacterPat);

    matches && matches.forEach(function(match) {
        var setting = reverseMap[match];
        inferred[setting] = inferred[setting] || 0;
        inferred[setting]++;
    });

    var result;
    var max = 0;
    Object.keys(inferred).forEach(function(setting) {
        var count = inferred[setting];
        if (count > max) {
            max = count;
            result = setting;
        }
    });

    return result;
};
