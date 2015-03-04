import charset = require('./rules/charset');
import end_of_line = require('./rules/end_of_line');
import indent_size = require('./rules/indent_size');
import indent_style = require('./rules/indent_style');
import line = require('./line');
import common = require('./rules/common');

export interface Settings {
	charset?: line.Charsets;
	end_of_line?: common.Newlines;
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
	check(context: Context, settings: Settings, line: line.Line): void;
	fix(settings: Settings, line: line.Line): line.Line;
	infer(line: line.Line): any;
}

export interface LinesRule {
	check(context: Context, settings: Settings, lines: line.Line[]): void;
	fix(settings: Settings, lines: line.Line[]): line.Line[];
	infer(line: line.Line[]): any;
}

export interface HashTable<T> {
	[key: string]: T;
}
