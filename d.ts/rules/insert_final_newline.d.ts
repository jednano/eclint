import eclint = require('../eclint');
import _line = require('../line');
declare class InsertFinalNewlineRule implements eclint.LinesRule {
    check(context: eclint.Context, settings: eclint.Settings, lines: _line.Line[]): void;
    fix(settings: eclint.Settings, lines: _line.Line[]): _line.Line[];
    infer(lines: _line.Line[]): boolean;
}
export = InsertFinalNewlineRule;
