var errorFactory = require('./errorFactory');
var Newline = require('./Newline');
var Line = (function () {
    function Line(raw, options) {
        options = options || {};
        this._number = options.number;
        if (this._number === 1) {
            this.BOM = parseBom(raw);
        }
        this.Newline = parseNewline(raw);
        this.Text = options.text || this.parseLineForText(raw);
        this.BOM = options.bom || this.BOM;
        this.Charsets = options.charset || reverseBomMap[this.BOM];
    }
    Object.defineProperty(Line.prototype, "Number", {
        get: function () {
            return this._number;
        },
        set: function (value) {
            if (!value) {
                delete this._number;
                return;
            }
            this._number = value;
            if (value === 1) {
                var bom = parseBom(this._text);
                if (bom) {
                    this._bom = bom;
                    this._charset = reverseBomMap[bom];
                    this._text = this._text.substr(bom.length);
                }
            }
            else {
                delete this._bom;
                delete this._charset;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "BOM", {
        get: function () {
            return this._bom;
        },
        set: function (value) {
            if (!value) {
                delete this._bom;
                delete this._charset;
                return;
            }
            var charset = reverseBomMap[value];
            if (!charset) {
                throw new Line.InvalidBomError('Invalid or unsupported BOM signature.');
            }
            this._bom = value;
            this._charset = charset;
            this._number = 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "Charsets", {
        get: function () {
            return this._charset;
        },
        set: function (value) {
            if (!value) {
                delete this._charset;
                delete this._bom;
                return;
            }
            this._charset = value;
            this._bom = bomMap[value];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "Text", {
        get: function () {
            return this._text;
        },
        set: function (value) {
            if (!value) {
                delete this._text;
                return;
            }
            this._text = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "Newline", {
        get: function () {
            return this._newline;
        },
        set: function (value) {
            if (!value) {
                delete this._newline;
                return;
            }
            this._newline = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "Raw", {
        get: function () {
            if (this._bom || this._text || this._newline) {
                return (this._bom || '') + (this._text || '') + (this._newline || '');
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Line.prototype.parseLineForText = function (s) {
        if (!s) {
            return undefined;
        }
        var start = this._bom ? this._bom.length : 0;
        var length = s.length - start - (this._newline ? this._newline.Length : 0);
        s = s.substr(start, length);
        if (s !== '') {
            return s;
        }
    };
    Line.prototype.toString = function () {
        return this._text;
    };
    Line.InvalidBomError = errorFactory.create({
        name: 'InvalidBomError'
    });
    Line.InvalidCharsetError = errorFactory.create({
        name: 'InvalidCharsetError'
    });
    Line.MultipleNewlinesError = errorFactory.create({
        name: 'MultipleNewlinesError'
    });
    return Line;
})();
exports.Line = Line;
function parseBom(s) {
    if (s) {
        var m = s.match(startsWithBom);
        return m && m[1];
    }
}
var bomMap = {
    utf_8_bom: '\u00EF\u00BB\u00BF',
    utf_16be: '\u00FE\u00FF',
    utf_32le: '\u00FF\u00FE\u0000\u0000',
    utf_16le: '\u00FF\u00FE',
    utf_32be: '\u0000\u0000\u00FE\u00FF'
};
var reverseBomMap = {};
var boms = Object.keys(bomMap).map(function (key) {
    var bom = bomMap[key];
    reverseBomMap[bom] = key;
    return bom;
});
var startsWithBom = new RegExp('^(' + boms.join('|') + ')');
function parseNewline(s) {
    var m = s && s.match(new RegExp(Newline.pattern.source, 'g'));
    if (!m) {
        return void (0);
    }
    if (m.length > 1) {
        throw new Line.MultipleNewlinesError('A line cannot have more than one newline character.');
    }
    return new Newline(m[0]);
}
