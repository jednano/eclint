var charMap = {
    // Carriage Return followed by Line Feed
    crlf: '\r\n',

    // Line Feed, U+000A
    lf: '\n',

    // Carriage Return, U+000D
    cr: '\r',

    // Vertical Tab
    vt: '\u000B',

    // Form Feed
    ff: '\u000C',

    // Next Line
    nel: '\u0085',

    // Line Separator
    ls: '\u2028',

    // Paragraph Separator
    ps: '\u2029'
};

var reverseMap = {};

var newlineCharacters = Object.keys(charMap).map(function(key) {
    var value = charMap[key];
    reverseMap[value] = key;
    return value;
});

var newlineCharacterPat = new RegExp(
    '(' + newlineCharacters.join('|') + ')', 'g');


exports.check = function(context, setting, data) {
    var matches = data.match(newlineCharacterPat);
    matches && matches.forEach(function(match) {
        var newlineCharacter = reverseMap[match];
        if (newlineCharacter !== setting) {
            context.report('Incorrect newline character found: ' +
                newlineCharacter);
        }
    });
};

exports.fix = function(setting, data) {
    var newlineCharacter = charMap[setting];
    return data.replace(newlineCharacterPat, function() {
        return newlineCharacter;
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
