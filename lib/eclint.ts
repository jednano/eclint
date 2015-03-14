///<reference path="../node_modules/linez/linez.d.ts" />
import linez = require('linez');

// ReSharper disable once InconsistentNaming
module eclint {

	export var boms = {
		'utf-8-bom': '\u00EF\u00BB\u00BF',
		'utf-16be': '\u00FE\u00FF',
		'utf-32le': '\u00FF\u00FE\u0000\u0000',
		'utf-16le': '\u00FF\u00FE',
		'utf-32be': '\u0000\u0000\u00FE\u00FF'
	};

	export var charsets = {
		'\u00EF\u00BB\u00BF': 'utf_8_bom',
		'\u00FE\u00FF': 'utf_16be',
		'\u00FF\u00FE\u0000\u0000': 'utf_32le',
		'\u00FF\u00FE': 'utf_16le',
		'\u0000\u0000\u00FE\u00FF': 'utf_32be'
	};

	export var newlines = {
		lf: '\n',
		'\n': 'lf',

		crlf: '\r\n',
		'\r\n': 'crlf',

		cr: '\r',
		'\r': 'cr'
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
		charset?: string;
		end_of_line?: string;
		indent_size?: any;
		indent_style?: string;
		insert_final_newline?: boolean;
		max_line_length?: number;
		tab_width?: number;
		trim_trailing_whitespace?: boolean;
	}

	export interface Context {
		report(message: string): void
	}

	export interface LineRule {
		check(context: Context, settings: Settings, line: linez.Line): void;
		fix(settings: Settings, line: linez.Line): linez.Line;
		infer(line: linez.Line): any;
	}

	export interface DocumentRule {
		check(context: Context, settings: Settings, lines: linez.Document): void;
		fix(settings: Settings, lines: linez.Document): linez.Document;
		infer(line: linez.Document): any;
	}

}

export = eclint;
