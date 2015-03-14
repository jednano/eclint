import linez = require('linez');
import eclint = require('../eclint');
declare class EndOfLineRule implements eclint.LineRule {
    check(context: eclint.Context, settings: eclint.Settings, line: linez.Line): void;
    fix(settings: eclint.Settings, line: linez.Line): linez.Line;
    infer(line: linez.Line): string;
}
export = EndOfLineRule;
