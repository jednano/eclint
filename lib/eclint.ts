///<reference path="../typings/lodash/lodash.d.ts" />
///<reference path="../typings/gulp-util/gulp-util.d.ts" />
///<reference path="../node_modules/linez/linez.d.ts" />
import _ = require('lodash');
import gutil = require('gulp-util');
import linez = require('linez');
import through = require('through2');
import File = require('vinyl');
var editorconfig = require('editorconfig');

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

	export interface Context {
		report(message: string): void
	}

	export interface Rule {
		type: string;
	}

	export interface LineRule extends Rule {
		check(context: Context, settings: Settings, line: linez.Line): void;
		fix(settings: Settings, line: linez.Line): linez.Line;
		infer(line: linez.Line): any;
	}

	export interface DocumentRule extends Rule {
		check(context: Context, settings: Settings, doc: linez.Document): void;
		fix(settings: Settings, doc: linez.Document): linez.Document;
		infer(doc: linez.Document): any;
	}

	export interface CommandOptions {
		settings?: Settings;
	}

	export interface Command {
		(options?: CommandOptions): NodeJS.ReadWriteStream;
	}

	interface Done {
		(err: Error, file?: File): void;
	}

	var ERROR_TEMPLATE = _.template('ECLint: <%= message %>');

	function createModuleError(message: string) {
		return new Error(ERROR_TEMPLATE({ message: message }));
	}

	var PLUGIN_NAME = 'ECLint';

	function createPluginError(err: Error) {
		return new gutil.PluginError(PLUGIN_NAME, err, { showStack: true });
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

	export function check(options?: CommandOptions) {

		options = options || {};
		var commandSettings = options.settings || {};
		return through.obj((file: File, enc: string, done: Done) => {

			if (file.isNull()) {
				done(null, file);
				return;
			}

			if (file.isStream()) {
				done(createModuleError('Streams are not supported'));
				return;
			}

			editorconfig.parse(file.path)
				.then((fileSettings: Settings) => {

					var settings = getSettings(fileSettings, commandSettings);
					var doc = linez(file.contents);

					var context = {
						report: (message: string) => {
							console.log(file.path + ':', message);
						}
					};

					Object.keys(settings).forEach(setting => {
						var rule: DocumentRule|LineRule = rules[setting];
						try {
							if (rule.type === 'DocumentRule') {
								(<DocumentRule>rule).check(context, settings, doc);
							} else {
								var check = (<LineRule>rule).check;
								doc.lines.forEach(line => {
									check(context, settings, line);
								});
							}
						} catch (err) {
							done(createPluginError(err));
						}
					});

					done(null, file);

				}, (err: Error) => {
					done(createPluginError(err));
				});
		});
	}

	export function fix(options?: CommandOptions) {

		options = options || {};
		var commandSettings = options.settings || {};
		return through.obj((file: File, enc: string, done: Done) => {

			if (file.isNull()) {
				done(null, file);
				return;
			}

			if (file.isStream()) {
				done(createModuleError('Streams are not supported'));
				return;
			}

			editorconfig.parse(file.path)
				.then((fileSettings: Settings) => {

					var settings = getSettings(fileSettings, commandSettings);
					var doc = linez(file.contents);

					Object.keys(settings).forEach(setting => {
						var rule: DocumentRule|LineRule = rules[setting];
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
					done(null, file);

				}, (err: Error) => {
					done(createPluginError(err));
				});
		});
	}

	// ReSharper disable once UnusedParameter
	export function infer(options?: CommandOptions) {
		return through.obj((file: File, enc: string, done: Done) => {

			if (file.isStream()) {
				done(createModuleError('Streams are not supported'));
				return;
			}

			done(createModuleError('Not implemented'));
		});
	}

}

export = eclint;
