///<reference path="../typings/lodash/lodash.d.ts" />
///<reference path="../typings/gulp-util/gulp-util.d.ts" />
///<reference path="../node_modules/linez/linez.d.ts" />
var os = require('os');
var _ = require('lodash');
var gutil = require('gulp-util');
var through = require('through2');
var editorconfig = require('editorconfig');
var linez = require('linez');
var File = require('vinyl');
var PluginError = gutil.PluginError;
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
        return new PluginError(PLUGIN_NAME, err, { showStack: true });
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
        var _this = this;
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
                    report: (options.reporter) ? options.reporter.bind(_this, file) : _.noop
                };
                Object.keys(settings).forEach(function (setting) {
                    var rule = rules[setting];
                    if (_.isUndefined(rule)) {
                        return;
                    }
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
                    if (_.isUndefined(rule)) {
                        return;
                    }
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
                file.contents = doc.toBuffer();
                done(null, file);
            }, function (err) {
                done(createPluginError(err));
            });
        });
    }
    eclint.fix = fix;
    function infer(options) {
        options = options || {};
        if (options.score && options.ini) {
            throw new PluginError(PLUGIN_NAME, 'Cannot generate tallied scores as ini file format');
        }
        var settings = {};
        function bufferContents(file, enc, done) {
            if (file.isNull()) {
                done();
                return;
            }
            if (file.isStream()) {
                done(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
                return;
            }
            function incrementSetting(setting, value) {
                setting[value] = setting[value] || 0;
                setting[value]++;
            }
            var doc = linez(file.contents);
            Object.keys(rules).forEach(function (key) {
                if (key === 'max_line_length') {
                    settings.max_line_length = 0;
                }
                else {
                    settings[key] = {};
                }
                var setting = settings[key];
                var rule = rules[key];
                try {
                    if (rule.type === 'DocumentRule') {
                        incrementSetting(setting, rule.infer(doc));
                    }
                    else {
                        var infer = rule.infer;
                        if (key === 'max_line_length') {
                            doc.lines.forEach(function (line) {
                                var inferredSetting = infer(line);
                                if (inferredSetting > settings.max_line_length) {
                                    settings.max_line_length = inferredSetting;
                                }
                            });
                        }
                        else {
                            doc.lines.forEach(function (line) {
                                incrementSetting(setting, infer(line));
                            });
                        }
                    }
                }
                catch (err) {
                    done(createPluginError(err));
                }
            });
            done();
        }
        function resolveScores() {
            function parseValue(value) {
                try {
                    return JSON.parse(value);
                }
                catch (err) {
                    return value;
                }
            }
            var result = {};
            Object.keys(rules).forEach(function (rule) {
                if (rule === 'max_line_length') {
                    result.max_line_length = Math.ceil(settings.max_line_length / 10) * 10;
                    return;
                }
                var maxScore = 0;
                var setting = settings[rule];
                Object.keys(setting).forEach(function (value) {
                    var score = setting[value];
                    var parsedValue = parseValue(value);
                    if (score >= maxScore && !_.isUndefined(parsedValue)) {
                        maxScore = score;
                        result[rule] = parsedValue;
                    }
                });
            });
            return result;
        }
        function endStream(done) {
            function emitContents(contents) {
                this.push(new File({ contents: new Buffer(contents) }));
                done();
            }
            if (options.score) {
                emitContents.call(this, JSON.stringify(settings));
                return;
            }
            var resolved = resolveScores();
            if (options.ini) {
                var lines = [
                    '# EditorConfig is awesome: http://EditorConfig.org',
                    ''
                ];
                if (options.root) {
                    [].push.apply(lines, [
                        '# top-most EditorConfig file',
                        'root = true',
                        ''
                    ]);
                }
                [].push.apply(lines, [
                    '[*]',
                    Object.keys(resolved).map(function (key) {
                        return key + ' = ' + resolved[key];
                    }).join(os.EOL)
                ]);
                emitContents.call(this, lines.join(os.EOL) + os.EOL);
                return;
            }
            emitContents.call(this, JSON.stringify(resolved));
        }
        return through.obj(bufferContents, endStream);
    }
    eclint.infer = infer;
})(eclint || (eclint = {}));
module.exports = eclint;
