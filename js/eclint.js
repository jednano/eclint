///<reference path="../typings/lodash/lodash.d.ts" />
///<reference path="../node_modules/linez/linez.d.ts" />
///<reference path="../typings/through2/through2.d.ts" />
///<reference path="../typings/vinyl/vinyl.d.ts" />
var _ = require('lodash');
var linez = require('linez');
var through = require('through2');
var editorconfig = require('editorconfig');
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
    var ERROR_TEMPLATE = _.template('ECLint: <%= message %>');
    function createModuleError(message) {
        return new Error(ERROR_TEMPLATE({ message: message }));
    }
    function check(options) {
        options = options || {};
        var commandSettings = options.settings || {};
        return through.obj(function (file, enc, done) {
            if (file.isStream()) {
                done(createModuleError('Streams are not supported'));
                return;
            }
            var fileSettings = editorconfig.parse(file.path);
            var settings = _.assign(fileSettings, commandSettings);
            var doc = linez(file.contents + '');
            var context = {
                report: function (message) {
                    console.log(file.path + ':', message);
                }
            };
            Object.keys(settings).forEach(function (setting) {
                var rule = require('./rules/' + setting);
                if (rule.type === 'DocumentRule') {
                    rule.check(context, settings, doc);
                }
                else {
                    var check = rule.check;
                    doc.lines.forEach(function (line) {
                        check(context, settings, line);
                    });
                }
            });
            done(null, file);
        });
    }
    eclint.check = check;
    function fix(options) {
        options = options || {};
        var commandSettings = options.settings || {};
        return through.obj(function (file, enc, done) {
            if (file.isStream()) {
                done(createModuleError('Streams are not supported'));
                return;
            }
            var fileSettings = editorconfig.parse(file.path);
            var settings = _.assign(fileSettings, commandSettings);
            var doc = linez(file.contents + '');
            Object.keys(settings).forEach(function (setting) {
                var rule = require('./rules/' + setting);
                if (rule.type === 'DocumentRule') {
                    rule.fix(settings, doc);
                }
                else {
                    var fix = rule.fix;
                    doc.lines.forEach(function (line) {
                        fix(settings, line);
                    });
                }
            });
            file.contents = new Buffer(doc + '');
            done(null, file);
        });
    }
    eclint.fix = fix;
    function infer() {
        return through.obj(function (file, enc, done) {
            if (file.isStream()) {
                done(createModuleError('Streams are not supported'));
                return;
            }
            done(createModuleError('Not implemented'));
        });
    }
    eclint.infer = infer;
})(eclint || (eclint = {}));
module.exports = eclint;
