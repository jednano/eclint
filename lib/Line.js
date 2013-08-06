var newline = require('./newline');


function Line(all, options) {
    options = options || {};
    this.number = options.number;
    this.all = all;
}

Object.defineProperties(Line.prototype, {
    all: {
        get: function() {
            return (this.bom || '') + this.text + (this.newline || '');
        },
        set: function(value) {
            this.text = value;
            parseBom.call(this);
            parseNewline.call(this);
        }
    },
    bom: {
        get: function() {
            return this._bom;
        },
        set: function(value) {
            this._bom = value;
            this._charset = findCharset(value);
        }
    },
    charset: {
        get: function() {
            return this._charset;
        },
        set: function(value) {
            this._charset = value;
            this._bom = findBom(value);
        }
    }
});

function parseBom() {
    if (this.number !== 1) {
        return;
    }
    var bom = findBom(this.text);
    if (bom) {
        this.bom = bom;
        this.text = this.text.substr(bom.length);
    }
}

function findBom(s) {
    var bomMatch = s.match(startsWithBom);
    return bomMatch && bomMatch[1];
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

function parseNewline() {
    if (!this.text) {
        return;
    }
    this.text.replace(newline.pattern, function(match, offset) {
        this.text = this.text.substr(0, offset);
        this.newline = new newline.Newline(match);
    }.bind(this));
}

function findCharset(s) {
    var bom = findBom(s);
    return bom && reverseBomMap[bom];
};

Line.prototype.toString = function() {
    return this.text;
};

module.exports = Line;
