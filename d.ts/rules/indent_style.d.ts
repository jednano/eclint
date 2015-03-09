import eclint = require('../eclint');
import _line = require('../line');
declare class IndentStyleRule implements eclint.LineRule {
    private reverseMap;
    check(context: eclint.Context, settings: eclint.Settings, line: _line.Line): void;
    infer(line: _line.Line): string;
    fix(settings: eclint.Settings, line: _line.Line): _line.Line;
    private resolveIndentSize(settings);
}
export = IndentStyleRule;
