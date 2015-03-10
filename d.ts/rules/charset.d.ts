import _line = require('../line');
import eclint = require('../eclint');
declare class CharsetRule implements eclint.LinesRule {
    check(context: eclint.Context, settings: eclint.Settings, lines: _line.Line[]): void;
    fix(settings: eclint.Settings, lines: _line.Line[]): _line.Line[];
    infer(lines: _line.Line[]): string;
}
export = CharsetRule;
