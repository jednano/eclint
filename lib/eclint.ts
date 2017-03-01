///<reference path="../typings/lodash/lodash.d.ts" />
///<reference path="../typings/gulp-util/gulp-util.d.ts" />
///<reference path="../node_modules/linez/linez.d.ts" />
import os = require('os');

import _ = require('lodash');
import gutil = require('gulp-util');
import through = require('through2');
var editorconfig = require('editorconfig');

import linez = require('linez');
import File = require('vinyl');
import EditorConfigError =  require('./editor-config-error');
var fileType = require('file-type');
var binaryExtensions = require('binary-extensions');

var PluginError = gutil.PluginError;

// ReSharper disable once InconsistentNaming
module eclint {

	export var charsets = {
		'\u00EF\u00BB\u00BF': 'utf_8_bom',
		'\u00FE\u00FF': 'utf_16be',
		'\u00FF\u00FE\u0000\u0000': 'utf_32le',
		'\u00FF\u00FE': 'utf_16le',
		'\u0000\u0000\u00FE\u00FF': 'utf_32be'
	};

	export function configure(options: ConfigurationOptions) {
		options = options || {};
		if (options.newlines) {
			linez.configure({ newlines: options.newlines });
		}
	}

	export interface ConfigurationOptions {
		newlines?: string[];
	}

	export interface Settings {
		/**
		 * Set to latin1, utf-8, utf-8-bom, utf-16be or utf-16le to control the
		 * character set.
		 */
		charset?: string;
		/**
		 * Set to tab or space to use hard tabs or soft tabs respectively.
		 */
		indent_style?: string;
		/**
		 * The number of columns used for each indentation level and the width
		 * of soft tabs (when supported). When set to tab, the value of
		 * tab_width (if specified) will be used.
		 */
		indent_size?: number|string;
		/**
		 * Number of columns used to represent a tab character. This defaults
		 * to the value of indent_size and doesn't usually need to be specified.
		 */
		tab_width?: number;
		/**
		 * Removes any whitespace characters preceding newline characters.
		 */
		trim_trailing_whitespace?: boolean;
		/**
		 * Set to lf, cr, or crlf to control how line breaks are represented.
		 */
		end_of_line?: string;
		/**
		 * Ensures files ends with a newline.
		 */
		insert_final_newline?: boolean;
		/**
		 * Enforces the maximum number of columns you can have in a line.
		 */
		max_line_length?: number;
	}

	export interface EditorConfigLintFile extends File {
		editorconfig?: EditorConfigLintResult
	}

	export interface EditorConfigLintResult {
		config: Settings;
		errors: EditorConfigError[];
		skiped: boolean;
		fixed: boolean;
	}

	export interface Rule {
		type: string;
		resolve(settings: Settings): any;
	}

	export interface LineRule extends Rule {
		check(settings: Settings, line: linez.Line): EditorConfigError;
		fix(settings: Settings, line: linez.Line): linez.Line;
		infer(line: linez.Line): any;
	}

	export interface DocumentRule extends Rule {
		check(settings: Settings, doc: linez.Document): EditorConfigError[];
		fix(settings: Settings, doc: linez.Document): linez.Document;
		infer(doc: linez.Document): any;
	}

	export interface CommandOptions {
		settings?: Settings;
		skipBinary?: boolean;
	}

	export interface Command {
		(options?: CommandOptions): NodeJS.ReadWriteStream;
	}

	interface Done {
		(err: Error, file?: File): void;
	}

	var ERROR_TEMPLATE = _.template('ECLint: <%= message %>');

	var PLUGIN_NAME = 'ECLint';

	function createPluginError(err: any) {
		return new PluginError(PLUGIN_NAME, err, {
			showStack: typeof err !== 'string'
		});
	}

	export var ruleNames = [
		'charset',
		'indent_style',
		'indent_size',
		'tab_width',
		'trim_trailing_whitespace',
		'end_of_line',
		'insert_final_newline',
		'max_line_length'
	];

	var rules: any = {};
	_.without(ruleNames, 'tab_width').forEach(name => {
		rules[name] = require('./rules/' + name);
	});

	function getSettings(fileSettings: Settings, commandSettings: Settings) {
		return _.omit(
			_.assign(fileSettings, commandSettings),
			['tab_width']
		);
	}

	function updateResult(file: EditorConfigLintFile, options: any) {
		options = _.assign({
			config: {},
			errors: [],
			skiped: false,
			fixed: false,
		}, options);
		if (file.editorconfig) {
			_.assign(file.editorconfig, options);
		} else {
			file.editorconfig = options;
		}
	}

	function isBinFile(file: EditorConfigLintFile, options?: CommandOptions) {
		var type = fileType(file.contents);
		return type && type.ext && binaryExtensions.indexOf(type.ext) >= 0;
	}

	function shouldSkipFile(file: EditorConfigLintFile, options?: CommandOptions) {
		var skipBinary = options && options.skipBinary;
		if ((skipBinary || skipBinary == null) && isBinFile(file, options)) {
			updateResult(file, {
				skiped: true,
			});
			return true;
		}
		return false;
	}

	export interface CheckCommandOptions extends CommandOptions {
		reporter?: (file: EditorConfigLintFile, error: EditorConfigError) => void;
	}

	export function check(options?: CheckCommandOptions) {

		options = options || {};
		var commandSettings = options.settings || {};
		return through.obj((file: EditorConfigLintFile, enc: string, done: Done) => {

			if (file.isStream()) {
				done(createPluginError('Streams are not supported'));
				return;
			}

			if (file.isNull() || shouldSkipFile(file, options)) {
				done(null, file);
				return;
			}

			editorconfig.parse(file.path)
				.then((fileSettings: Settings) => {
					var errors: EditorConfigError[] = [];

					var settings = getSettings(fileSettings, commandSettings);
					var doc = linez(file.contents);

					function addError(error?: EditorConfigError) {
						if (error) {
							error.fileName = file.path;
							errors.push(error);
						}
					}

					Object.keys(settings).forEach(setting => {
						var rule: DocumentRule|LineRule = rules[setting];
						if (_.isUndefined(rule)) {
							return;
						}
						try {
							if (rule.type === 'DocumentRule') {
								(<DocumentRule>rule).check(settings, doc).forEach(addError);
							} else {
								var check = (<LineRule>rule).check;
								doc.lines.forEach(line => {
									addError(check(settings, line));
								});
							}
						} catch (err) {
							done(createPluginError(err));
						}
					});

					updateResult(file, {
						fixed: Boolean(file.editorconfig && file.editorconfig.fixed),
						config: fileSettings,
						errors
					});

					if (options.reporter && errors.length) {
						errors.forEach(options.reporter.bind(this, file));
					}

					done(null, file);

				}, (err: Error) => {
					done(createPluginError(err));
				});
		});
	}

	export function fix(options?: CommandOptions) {

		options = options || {};
		var commandSettings = options.settings || {};
		return through.obj((file: EditorConfigLintFile, enc: string, done: Done) => {

			if (file.isStream()) {
				done(createPluginError('Streams are not supported'));
				return;
			}

			if (file.isNull() || shouldSkipFile(file, options)) {
				done(null, file);
				return;
			}

			editorconfig.parse(file.path)
				.then((fileSettings: Settings) => {

					var settings = getSettings(fileSettings, commandSettings);
					var doc = linez(file.contents);

					Object.keys(settings).forEach(setting => {
						var rule: DocumentRule|LineRule = rules[setting];
						if (_.isUndefined(rule)) {
							return;
						}
						try {
							if (rule.type === 'DocumentRule') {
								(<DocumentRule>rule).fix(settings, doc);
							} else {
								var fix = (<LineRule>rule).fix;
								doc.lines.forEach(line => {
									fix(settings, line);
								});
							}
						} catch (err) {
							done(createPluginError(err));
						}
					});

					file.contents = doc.toBuffer();

					updateResult(file, {
						fixed: true,
						config: fileSettings,
						errors: (file.editorconfig && file.editorconfig.errors) || []
					});

					done(null, file);

				}, (err: Error) => {
					done(createPluginError(err));
				});
		});
	}

	export interface InferOptions {
		/**
		 * Shows the tallied score for each setting.
		 */
		score?: boolean;
		/**
		 * Exports file as ini file type.
		 */
		ini?: boolean;
		/**
		 * Adds root = true to the top of your ini file, if any.
		 */
		root?: boolean;
	}

	export interface ScoredSetting {
		[key: string]: {
			[key: string]: number;
		}
	}

	export interface ScoredSettings {
		charset?: ScoredSetting;
		indent_style?: ScoredSetting;
		indent_size?: ScoredSetting;
		trim_trailing_whitespace?: ScoredSetting;
		end_of_line?: ScoredSetting;
		insert_final_newline?: ScoredSetting;
		max_line_length?: number;
	}

	export function infer(options?: InferOptions) {
		options = options || {};

		if (options.score && options.ini) {
			throw new PluginError(PLUGIN_NAME, 'Cannot generate tallied scores as ini file format');
		}

		var settings: ScoredSettings = {};

		function bufferContents(file: File, enc: string, done: Function) {
			if (file.isNull()) {
				done();
				return;
			}

			if (file.isStream()) {
				done(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
				return;
			}

			function incrementSetting(setting: { [key: string]: number }, value: any) {
				setting[value] = setting[value] || 0;
				setting[value]++;
			}

			var doc = linez(file.contents);
			Object.keys(rules).forEach(key => {
				if (key === 'max_line_length') {
					settings.max_line_length = 0;
				} else {
					settings[key] = {};
				}
				var setting = settings[key];
				var rule: DocumentRule|LineRule = rules[key];
				try {
					if (rule.type === 'DocumentRule') {
						incrementSetting(setting, (<DocumentRule>rule).infer(doc));
					} else {
						var infer = (<LineRule>rule).infer;
						if (key === 'max_line_length') {
							doc.lines.forEach(line => {
								var inferredSetting = infer(line);
								if (inferredSetting > settings.max_line_length) {
									settings.max_line_length = inferredSetting;
								}
							});
						} else {
							doc.lines.forEach(line => {
								incrementSetting(setting, infer(line));
							});
						}
					}
				} catch (err) {
					done(createPluginError(err));
				}
			});

			done();
		}

		function resolveScores() {
			function parseValue(value: any) {
				try {
					return JSON.parse(value);
				} catch (err) {
					return value;
				}
			}
			var result: Settings = {};
			Object.keys(rules).forEach(rule => {
				if (rule === 'max_line_length') {
					result.max_line_length = Math.ceil(settings.max_line_length / 10) * 10;
					return;
				}
				var maxScore = 0;
				var setting = settings[rule];
				Object.keys(setting).forEach(value => {
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

		function endStream(done: Function) {
			function emitContents(contents: string) {
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
					Object.keys(resolved).map(key => {
						return key + ' = ' + resolved[key];
					}).join(os.EOL)
				]);
				emitContents.call(this, lines.join(os.EOL) + os.EOL);
				return;
			}

			emitContents.call(this, JSON.stringify(resolved));
		}

		return through.obj(bufferContents, <any>endStream);
	}

}

export = eclint;
