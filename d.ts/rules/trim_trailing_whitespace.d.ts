import linez = require('linez');
import eclint = require('../eclint');
declare class TrimTrailingWhitespaceRule implements eclint.LineRule {
    check(context: eclint.Context, settings: eclint.Settings, line: linez.Line): void;
    fix(settings: eclint.Settings, line: linez.Line): linez.Line;
    infer(line: linez.Line): boolean;
}
export = TrimTrailingWhitespaceRule;
