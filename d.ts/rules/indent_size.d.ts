import eclint = require('../eclint');
import _line = require('../line');
declare class IndentSizeRule implements eclint.LineRule {
    check(context: eclint.Context, settings: eclint.Settings, line: _line.Line): void;
    infer(line: _line.Line): any;
    fix(settings: eclint.Settings, line: _line.Line): _line.Line;
    private applyRule(settings);
}
export = IndentSizeRule;
