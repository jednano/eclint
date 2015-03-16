///<reference path="../typings/lodash/lodash.d.ts" />
///<reference path="../typings/gulp-util/gulp-util.d.ts" />
///<reference path="../node_modules/linez/linez.d.ts" />
var _ = require('lodash');
var gutil = require('gulp-util');
var linez = require('linez');
var through = require('through2');
var editorconfig = require('editorconfig');
// ReSharper disable once InconsistentNaming
var eclint;
(function (eclint) {
    eclint.charsets = {
        '\u00EF\u00BB\u00BF': 'utf_8_bom',
        '\u00FE\u00FF': 'utf_16be',
        '\u00FF\u00FE\u0000\u0000': 'utf_32le',
        '\u00FF\u00FE': 'utf_16le',
        '\u0000\u0000\u00FE\u00FF': 'utf_32be'
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
    var PLUGIN_NAME = 'ECLint';
    function createPluginError(err) {
        return new gutil.PluginError(PLUGIN_NAME, err, { showStack: true });
    }
    eclint.ruleNames = [
        'charset',
        'indent_style',
        'indent_size',
        'tab_width',
        'trim_trailing_whitespace',
        'end_of_line',
        'insert_final_newline',
        'max_line_length'
    ];
    var rules = {};
    _.without(eclint.ruleNames, 'tab_width').forEach(function (name) {
        rules[name] = require('./rules/' + name);
    });
    function getSettings(fileSettings, commandSettings) {
        return _.omit(_.assign(fileSettings, commandSettings), ['tab_width']);
    }
    function check(options) {
        options = options || {};
        var commandSettings = options.settings || {};
        return through.obj(function (file, enc, done) {
            if (file.isNull()) {
                done(null, file);
                return;
            }
            if (file.isStream()) {
                done(createModuleError('Streams are not supported'));
                return;
            }
            editorconfig.parse(file.path).then(function (fileSettings) {
                var settings = getSettings(fileSettings, commandSettings);
                var doc = linez(file.contents);
                var context = {
                    report: function (message) {
                        console.log(file.path + ':', message);
                    }
                };
                Object.keys(settings).forEach(function (setting) {
                    var rule = rules[setting];
                    try {
                        if (rule.type === 'DocumentRule') {
                            rule.check(context, settings, doc);
                        }
                        else {
                            var check = rule.check;
                            doc.lines.forEach(function (line) {
                                check(context, settings, line);
                            });
                        }
                    }
                    catch (err) {
                        done(createPluginError(err));
                    }
                });
                done(null, file);
            }, function (err) {
                done(createPluginError(err));
            });
        });
    }
    eclint.check = check;
    function fix(options) {
        options = options || {};
        var commandSettings = options.settings || {};
        return through.obj(function (file, enc, done) {
            if (file.isNull()) {
                done(null, file);
                return;
            }
            if (file.isStream()) {
                done(createModuleError('Streams are not supported'));
                return;
            }
            editorconfig.parse(file.path).then(function (fileSettings) {
                var settings = getSettings(fileSettings, commandSettings);
                var doc = linez(file.contents);
                Object.keys(settings).forEach(function (setting) {
                    var rule = rules[setting];
                    try {
                        if (rule.type === 'DocumentRule') {
                            rule.fix(settings, doc);
                        }
                        else {
                            var fix = rule.fix;
                            doc.lines.forEach(function (line) {
                                fix(settings, line);
                            });
                        }
                    }
                    catch (err) {
                        done(createPluginError(err));
                    }
                });
                file.contents = new Buffer(doc + '');
                done(null, file);
            }, function (err) {
                done(createPluginError(err));
            });
        });
    }
    eclint.fix = fix;
    // ReSharper disable once UnusedParameter
    function infer(options) {
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
