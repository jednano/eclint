var _line = require('../line');
(function (Newlines) {
    Newlines[Newlines["lf"] = 0] = "lf";
    Newlines[Newlines["crlf"] = 1] = "crlf";
    Newlines[Newlines["cr"] = 2] = "cr";
    Newlines[Newlines["ls"] = 3] = "ls";
    Newlines[Newlines["ps"] = 4] = "ps";
})(exports.Newlines || (exports.Newlines = {}));
var Newlines = exports.Newlines;
;
(function (IndentStyles) {
    IndentStyles[IndentStyles["space"] = 0] = "space";
    IndentStyles[IndentStyles["tab"] = 1] = "tab";
})(exports.IndentStyles || (exports.IndentStyles = {}));
var IndentStyles = exports.IndentStyles;
exports.Charsets = _line.Charsets;
