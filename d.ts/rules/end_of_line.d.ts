import eclint = require('../eclint');
import _line = require('../line');
import common = require('./common');
declare class EndOfLineRule implements eclint.LineRule {
    check(context: eclint.Context, settings: eclint.Settings, line: _line.Line): void;
    fix(settings: eclint.Settings, line: _line.Line): _line.Line;
    infer(line: _line.Line): common.Newlines;
}
export = EndOfLineRule;
