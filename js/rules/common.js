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
exports.Charsets = _line.Charsets;
