/// <reference path="../typings/lodash/lodash.d.ts" />
/// <reference path="../typings/gulp-util/gulp-util.d.ts" />
/// <reference path="../node_modules/linez/linez.d.ts" />
import linez = require('linez');
declare module eclint {
    var charsets: {
        '\u00EF\u00BB\u00BF': string;
        '\u00FE\u00FF': string;
        '\u00FF\u00FE\u0000\u0000': string;
        '\u00FF\u00FE': string;
        '\u0000\u0000\u00FE\u00FF': string;
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
        indent_size?: number | string;
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
        resolve(settings: Settings): any;
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
    var ruleNames: string[];
    interface CheckCommandOptions extends CommandOptions {
        reporter?: (message: string) => void;
    }
    function check(options?: CheckCommandOptions): NodeJS.ReadWriteStream;
    function fix(options?: CommandOptions): NodeJS.ReadWriteStream;
    interface InferOptions {
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
    interface ScoredSetting {
        [key: string]: {
            [key: string]: number;
        };
    }
    interface ScoredSettings {
        charset?: ScoredSetting;
        indent_style?: ScoredSetting;
        indent_size?: ScoredSetting;
        trim_trailing_whitespace?: ScoredSetting;
        end_of_line?: ScoredSetting;
        insert_final_newline?: ScoredSetting;
        max_line_length?: number;
    }
    function infer(options?: InferOptions): NodeJS.ReadWriteStream;
}
export = eclint;
