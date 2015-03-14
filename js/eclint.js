///<reference path="../node_modules/linez/linez.d.ts" />
var linez = require('linez');
// ReSharper disable once InconsistentNaming
var eclint;
(function (eclint) {
    eclint.boms = {
        'utf-8-bom': '\u00EF\u00BB\u00BF',
        'utf-16be': '\u00FE\u00FF',
        'utf-32le': '\u00FF\u00FE\u0000\u0000',
        'utf-16le': '\u00FF\u00FE',
        'utf-32be': '\u0000\u0000\u00FE\u00FF'
    };
    eclint.charsets = {
        '\u00EF\u00BB\u00BF': 'utf_8_bom',
        '\u00FE\u00FF': 'utf_16be',
        '\u00FF\u00FE\u0000\u0000': 'utf_32le',
        '\u00FF\u00FE': 'utf_16le',
        '\u0000\u0000\u00FE\u00FF': 'utf_32be'
    };
    eclint.newlines = {
        lf: '\n',
        '\n': 'lf',
        crlf: '\r\n',
        '\r\n': 'crlf',
        cr: '\r',
        '\r': 'cr'
    };
    function configure(options) {
        options = options || {};
        if (options.newlines) {
            linez.configure({ newlines: options.newlines });
        }
    }
    eclint.configure = configure;
})(eclint || (eclint = {}));
module.exports = eclint;
