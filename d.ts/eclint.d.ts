/// <reference path="../typings/lodash/lodash.d.ts" />
/// <reference path="../node_modules/linez/linez.d.ts" />
/// <reference path="../typings/through2/through2.d.ts" />
/// <reference path="../typings/vinyl/vinyl.d.ts" />
import linez = require('linez');
declare module eclint {
    var boms: {
        'utf-8-bom': string;
        'utf-16be': string;
        'utf-32le': string;
        'utf-16le': string;
        'utf-32be': string;
    };
    var charsets: {
        '\u00EF\u00BB\u00BF': string;
        '\u00FE\u00FF': string;
        '\u00FF\u00FE\u0000\u0000': string;
        '\u00FF\u00FE': string;
        '\u0000\u0000\u00FE\u00FF': string;
    };
    var newlines: {
        lf: string;
        '\n': string;
        crlf: string;
        '\r\n': string;
        cr: string;
        '\r': string;
    };
    function configure(options: ConfigurationOptions): void;
    interface ConfigurationOptions {
        newlines?: string[];
    }
    interface Settings {
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
        indent_size?: any;
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
    interface Context {
        report(message: string): void;
    }
    interface Rule {
        type: string;
    }
    interface LineRule extends Rule {
        check(context: Context, settings: Settings, line: linez.Line): void;
        fix(settings: Settings, line: linez.Line): linez.Line;
        infer(line: linez.Line): any;
    }
    interface DocumentRule extends Rule {
        check(context: Context, settings: Settings, doc: linez.Document): void;
        fix(settings: Settings, doc: linez.Document): linez.Document;
        infer(doc: linez.Document): any;
    }
    interface CommandOptions {
        settings?: Settings;
    }
    interface Command {
        (options?: CommandOptions): NodeJS.ReadWriteStream;
    }
    function check(options?: CommandOptions): NodeJS.ReadWriteStream;
    function fix(options?: CommandOptions): NodeJS.ReadWriteStream;
    function infer(): NodeJS.ReadWriteStream;
}
export = eclint;
