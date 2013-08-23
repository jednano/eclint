var util = require('util');

var Error = require('./Error');
var newline = require('./newline');


function Line(raw, options) {
    if (raw && typeof raw !== 'string') {
        options = raw;
        raw = '';
    } else {
        options = options || {};
    }
    this.number = options.number;
    if (this.number === 1) {
        this.bom = parseBom(raw);
    }
    this.newline = parseNewline(raw);
    this.text = options.text || parseLineForText.call(this, raw);
    this.bom = options.bom || this.bom;
    this.charset = options.charset || reverseBomMap[this.bom];
}

Object.defineProperties(Line.prototype, {
    number: {
        get: function() {
            return this._number;
        },
        set: function(value) {
            if (!value) {
                delete this._number;
                return;
            }
            this._number = value;
            if (value === 1) {
                var bom = parseBom(this.text);
                if (bom) {
                    this._bom = bom;
                    this._charset = reverseBomMap[bom];
                    this.text = this.text.substr(bom.length);
                }
            } else {
                delete this._bom;
                delete this._charset;
            }
        }
    },
    bom: {
        get: function() {
            return this._bom;
        },
        set: function(value) {
            if (!value) {
                delete this._bom;
                delete this._charset;
                return;
            }
            var charset = reverseBomMap[value];
            if (!charset) {
                throw new this.InvalidBomError(
                    'Invalid or unsupported BOM signature.');
            }
            this._bom = value;
            this._charset = charset;
            this._number = 1;
        }
    },
    charset: {
        get: function() {
            return this._charset;
        },
        set: function(value) {
            if (!value) {
                delete this._charset;
                delete this._bom;
                return;
            }
            var bom = bomMap[value];
            if (!bom) {
                throw new this.InvalidCharsetError(
                    'Invalid or unsupported charset.');
            }
            this._charset = value;
            this._bom = bomMap[value];
        }
    },
    text: {
        get: function() {
            return this._text;
        },
        set: function(value) {
            if (!value) {
                delete this._text;
                return;
            }
            this._text = value;
        }
    },
    newline: {
        get: function() {
            return this._newline;
        },
        set: function(value) {
            if (!value) {
                delete this._newline;
                return;
            }
            if (!newline.pattern.test(value)) {
                throw new this.InvalidNewlineError(
                    'Invalid or unsupported newline character.');
            }
            this._newline = value;
        }
    },
    raw: {
        get: function() {
            if (this.bom || this.text || this.newline) {
                return (this.bom || '') + (this.text || '') +
                    (this.newline || '');
            }
            return void 0;
        }
    }
});

function parseBom(s) {
    if (s) {
        var m = s.match(startsWithBom);
        return m && m[1];
    }
}

var bomMap = {
    'utf-8-bom': '\u00EF\u00BB\u00BF',
    'utf-16be': '\u00FE\u00FF',
    'utf-32le': '\u00FF\u00FE\u0000\u0000',
    'utf-16le': '\u00FF\u00FE',
    'utf-32be': '\u0000\u0000\u00FE\u00FF'
};

var reverseBomMap = {};
var boms = Object.keys(bomMap).map(function(key) {
    var bom = bomMap[key];
    reverseBomMap[bom] = key;
    return bom;
});

var startsWithBom = new RegExp('^(' + boms.join('|') +')');

function parseNewline(s) {
    var result;
    s && s.replace(newline.pattern, function(match) {
        result = new newline.Newline(match);
    });
    return result;
}

function parseLineForText(s) {
    if (!s) {
        return void 0;
    }
    var start = this.bom ? this.bom.length : 0;
    var length = s.length - start - (this.newline ? this.newline.length : 0);
    s = s.substr(start, length);
    return s !== '' ? s : void 0;
}

Line.prototype.toString = function() {
    return this.text;
};

Line.prototype.InvalidBomError = Error.extend({
    name: 'InvalidBomError'
});

Line.prototype.InvalidCharsetError = Error.extend({
    name: 'InvalidCharsetError'
});

Line.prototype.InvalidNewlineError = Error.extend({
    name: 'InvalidNewlineError'
});

module.exports = Line;
