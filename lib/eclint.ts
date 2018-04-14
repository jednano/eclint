import * as editorconfig from 'editorconfig';
import * as linez from 'linez';
import * as _ from 'lodash';
import * as os from 'os';
import * as PluginError from 'plugin-error';
import * as stream from 'stream';
import * as through from 'through2';
import * as File from 'vinyl';
import * as doc from './doc';
import EditorConfigError = require('./editor-config-error');

export let charsets = {
	'\u0000\u0000\u00FE\u00FF': 'utf_32be',
	'\u00EF\u00BB\u00BF': 'utf_8_bom',
	'\u00FE\u00FF': 'utf_16be',
	'\u00FF\u00FE': 'utf_16le',
	'\u00FF\u00FE\u0000\u0000': 'utf_32le',
};

export function configure(options: IConfigurationOptions) {
	options = options || {};
	if (options.newlines) {
		linez.configure({ newlines: options.newlines });
	}
}

export interface IConfigurationOptions {
	newlines?: string[];
}

export interface ISettings {
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
	block_comment?: string;
	block_comment_start?: string;
	block_comment_end?: string;
}

export interface IEditorConfigLintFile extends File {
	editorconfig?: IEditorConfigLintResult;
	contents: Buffer;
}

export interface IEditorConfigLintResult {
	config: ISettings;
	errors: EditorConfigError[];
	fixed: boolean;
}

export interface IRule {
	type: string;
	resolve(settings: ISettings): string|number|boolean;
}

export interface ILineRule extends IRule {
	check(settings: ISettings, line: doc.Line): EditorConfigError;
	fix(settings: ISettings, line: doc.Line): doc.Line;
	infer(line: doc.Line): string|number|boolean;
}

export interface IDocumentRule extends IRule {
	check(settings: ISettings, doc: doc.IDocument): EditorConfigError[];
	fix(settings: ISettings, doc: doc.IDocument): doc.IDocument;
	infer(doc: doc.IDocument): string|number|boolean;
}

export interface ICommandOptions {
	settings?: ISettings;
}

export type Command = (options?: ICommandOptions) => NodeJS.ReadWriteStream;

type Done = (err?: Error, file?: File) => void;

const PLUGIN_NAME = 'ECLint';

function createPluginError(err: Error | string, options?: PluginError.Options): PluginError {
	return new PluginError(PLUGIN_NAME, err, options);
}

export let ruleNames = [
	'charset',
	'indent_style',
	'indent_size',
	'tab_width',
	'trim_trailing_whitespace',
	'end_of_line',
	'insert_final_newline',
	'max_line_length',
	`block_comment`,
	'block_comment_start',
	'block_comment_end',
];

const rules: {
	[key: string]: IDocumentRule|ILineRule,
} = {};
_.without(
	ruleNames,
	'tab_width',
	`block_comment`,
	'block_comment_start',
	'block_comment_end',
).forEach((name) => {
	rules[name] = require('./rules/' + name);
});

function getSettings(fileSettings: editorconfig.KnownProps, commandSettings: ISettings | editorconfig.KnownProps) {
	return _.pickBy(
		_.omit(
			_.assign(
				fileSettings,
				commandSettings,
			),
			['tab_width'],
		),
		(value) => value !== 'unset',
	) as ISettings;
}

function updateResult(file: IEditorConfigLintFile, options: any) {
	if (file.editorconfig) {
		_.assign(file.editorconfig, options);
	} else {
		file.editorconfig = options;
	}
}

export interface ICheckCommandOptions extends ICommandOptions {
	reporter?: (file: IEditorConfigLintFile, error: EditorConfigError) => void;
}

export function check(options?: ICheckCommandOptions): stream.Transform {

	options = options || {};
	const commandSettings = options.settings || {};
	return through.obj((file: IEditorConfigLintFile, _enc: string, done: Done) => {

		if (file.isNull()) {
			done(null, file);
			return;
		}

		if (file.isStream()) {
			done(createPluginError('Streams are not supported'));
			return;
		}

		editorconfig.parse(file.path)
			.then((fileSettings: editorconfig.KnownProps) => {
				const errors: EditorConfigError[] = [];

				const settings = getSettings(fileSettings, commandSettings);
				const document = doc.create(file.contents, settings);

				function addError(error?: EditorConfigError) {
					if (error) {
						error.fileName = file.path;
						errors.push(error);
					}
				}

				Object.keys(settings).forEach((setting) => {
					const rule: IDocumentRule|ILineRule = rules[setting];
					if (_.isUndefined(rule)) {
						return;
					}
					if (rule.type === 'DocumentRule') {
						(rule as IDocumentRule).check(settings, document).forEach(addError);
					} else {
						const checkFn = (rule as ILineRule).check;
						document.lines.forEach((line) => {
							addError(checkFn(settings, line));
						});
					}
				});

				updateResult(file, {
					config: fileSettings,
					errors,
					fixed: !!(_.get(file, 'editorconfig.fixed')),
				});

				if (options.reporter && errors.length) {
					errors.forEach(options.reporter.bind(this, file));
				}

				done(null, file);

			}).catch((err: Error) => {
				done(createPluginError(err));
			});
	});
}

export function fix(options?: ICommandOptions): stream.Transform {

	options = options || {};
	const commandSettings = options.settings || {};
	return through.obj((file: IEditorConfigLintFile, _enc: string, done: Done) => {

		if (file.isNull()) {
			done(null, file);
			return;
		}

		if (file.isStream()) {
			done(createPluginError('Streams are not supported'));
			return;
		}

		editorconfig.parse(file.path)
			.then((fileSettings: editorconfig.KnownProps) => {
				if ((commandSettings.indent_style || fileSettings.indent_style) === 'tab') {
					fileSettings = _.omit(
						fileSettings,
						[
							'tab_width',
							'indent_size',
						],
					);
				}

				const settings = getSettings(fileSettings, commandSettings);
				const document = doc.create(file.contents, settings);

				Object.keys(settings).forEach((setting) => {
					const rule: IDocumentRule|ILineRule = rules[setting];
					if (_.isUndefined(rule)) {
						return;
					}
					if (rule.type === 'DocumentRule') {
						(rule as IDocumentRule).fix(settings, document);
					} else {
						const fixFn = (rule as ILineRule).fix;
						document.lines.forEach((line) => {
							fixFn(settings, line);
						});
					}
				});

				file.contents = document.toBuffer();

				updateResult(file, {
					config: fileSettings,
					errors: _.get(file, 'editorconfig.errors') || [],
					fixed: true,
				});

				done(null, file);

			}).catch((err: Error) => {
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

export interface IScoredSetting {
	[key: string]: {
		[key: string]: number;
	};
}

export interface IScoredSettings {
	charset?: IScoredSetting;
	indent_style?: IScoredSetting;
	indent_size?: IScoredSetting;
	trim_trailing_whitespace?: IScoredSetting;
	end_of_line?: IScoredSetting;
	insert_final_newline?: IScoredSetting;
	max_line_length?: number;
}

export function infer(options?: InferOptions): stream.Transform {
	options = options || {};

	if (options.score && options.ini) {
		throw createPluginError('Cannot generate tallied scores as ini file format');
	}

	const settings: IScoredSettings = {};

	function bufferContents(file: IEditorConfigLintFile, _enc: string, done: Done) {
		if (file.isNull()) {
			done();
			return;
		}

		if (file.isStream()) {
			done(createPluginError('Streaming not supported'));
			return;
		}

		function incrementSetting(setting: { [key: string]: number }, value: any) {
			setting[value] = setting[value] || 0;
			setting[value]++;
		}

		const document = doc.create(file.contents);
		Object.keys(rules).forEach((key) => {
			if (key === 'max_line_length') {
				settings.max_line_length = 0;
			} else {
				settings[key] = {};
			}
			const setting = settings[key];
			const rule: IDocumentRule|ILineRule = rules[key];
			try {
				if (rule.type === 'DocumentRule') {
					incrementSetting(setting, (rule as IDocumentRule).infer(document));
				} else {
					const inferFn = (rule as ILineRule).infer;
					if (key === 'max_line_length') {
						document.lines.forEach((line) => {
							const inferredSetting = inferFn(line);
							if (inferredSetting > settings.max_line_length) {
								settings.max_line_length = inferredSetting as number;
							}
						});
					} else {
						document.lines.forEach((line) => {
							incrementSetting(setting, inferFn(line));
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
		const result: ISettings = {};
		Object.keys(rules).forEach((rule) => {
			if (rule === 'max_line_length') {
				result.max_line_length = Math.ceil(settings.max_line_length / 10) * 10;
				return;
			}
			let maxScore = 0;
			const setting = settings[rule];
			Object.keys(setting).forEach((value) => {
				const score = setting[value];
				const parsedValue = parseValue(value);
				if (score >= maxScore && !_.isUndefined(parsedValue)) {
					maxScore = score;
					result[rule] = parsedValue;
				}
			});
		});
		return result;
	}

	function endStream(done: (error?: Error) => void) {
		function emitContents(contents: string) {
			this.push(new File({ contents: new Buffer(contents) }));
			done();
		}

		if (options.score) {
			emitContents.call(this, JSON.stringify(settings));
			return;
		}

		const resolved = resolveScores();

		if (options.ini) {
			const lines = [
				'# EditorConfig is awesome: http://EditorConfig.org',
				'',
			];
			if (options.root) {
				[].push.apply(lines, [
					'# top-most EditorConfig file',
					'root = true',
					'',
				]);
			}
			[].push.apply(lines, [
				'[*]',
				Object.keys(resolved).map((key) => {
					return key + ' = ' + resolved[key];
				}).join(os.EOL),
			]);
			emitContents.call(this, lines.join(os.EOL) + os.EOL);
			return;
		}

		emitContents.call(this, JSON.stringify(resolved));
	}

	return through.obj(bufferContents, endStream);
}
