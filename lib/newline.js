var map = {
    // Line Feed, U+000A
    lf: '\n',

    // Carriage Return + Line Feed
    crlf: '\r\n',

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

var chars = Object.keys(map).map(function(key) {
    var character = map[key];
    reverseMap[character] = key;
    return character;
});

var pattern = /\n|\r(?!\n)|\u2028|\u2029|\r\n/g;

function Newline(character) {
    this.char = character;
}

Object.defineProperty(Newline.prototype, 'name', {
    get: function() {
        return reverseMap[this.char];
    },
    set: function(value) {
        this.char = map[value];
    }
});

Newline.prototype.toString = function() {
    return this.char;
};

module.exports = {
    map: map,
    reverseMap: reverseMap,
    chars: chars,
    pattern: pattern,
    Newline: Newline
};
