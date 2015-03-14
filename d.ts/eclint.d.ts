/// <reference path="../node_modules/linez/linez.d.ts" />
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
        charset?: string;
        end_of_line?: string;
        indent_size?: any;
        indent_style?: string;
        insert_final_newline?: boolean;
        max_line_length?: number;
        tab_width?: number;
        trim_trailing_whitespace?: boolean;
    }
    interface Context {
        report(message: string): void;
    }
    interface LineRule {
        check(context: Context, settings: Settings, line: linez.Line): void;
        fix(settings: Settings, line: linez.Line): linez.Line;
        infer(line: linez.Line): any;
    }
    interface DocumentRule {
        check(context: Context, settings: Settings, lines: linez.Document): void;
        fix(settings: Settings, lines: linez.Document): linez.Document;
        infer(line: linez.Document): any;
    }
}
export = eclint;
