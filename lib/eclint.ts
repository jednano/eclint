///<reference path='../vendor/dt-node/node.d.ts'/>
import charset = require('./rules/charset');
import end_of_line = require('./rules/end_of_line');
import indent_size = require('./rules/indent_size');
import indent_style = require('./rules/indent_style');
import line = require('./line');


export interface Settings {
	charset?: line.Charsets;
	end_of_line?: end_of_line.Newlines;
	indent_size?: indent_size.IndentSizes;
	indent_style?: indent_style.IndentStyles;
	insert_final_newline?: boolean;
	max_line_length?: number;
	tab_width?: number;
	trim_trailing_whitespace?: boolean
}

export interface Context {
	report(message: string): void
}
