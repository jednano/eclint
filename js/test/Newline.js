var errorFactory = require('./errorFactory');
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
var chars = Object.keys(map).map(function (key) {
    var character = map[key];
    reverseMap[character] = key;
    return character;
});
var Newline = (function () {
    function Newline(Character) {
        this.Character = Character;
        if (!Newline.pattern.test(Character)) {
            throw new Newline.InvalidNewlineError('Invalid or unsupported newline character.');
        }
    }
    Object.defineProperty(Newline.prototype, "Name", {
        get: function () {
            return reverseMap[this.Character];
        },
        set: function (value) {
            this.Character = map[value];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Newline.prototype, "Length", {
        get: function () {
            return this.Character && this.Character.length;
        },
        enumerable: true,
        configurable: true
    });
    Newline.prototype.toString = function () {
        return this.Character;
    };
    Newline.pattern = /\n|\r(?!\n)|\u2028|\u2029|\r\n/;
    Newline.map = map;
    Newline.reverseMap = reverseMap;
    Newline.chars = chars;
    Newline.InvalidNewlineError = errorFactory.create({
        name: 'InvalidNewlineError'
    });
    return Newline;
})();
module.exports = Newline;
