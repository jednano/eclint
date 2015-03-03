import eclint = require('../eclint');
import _line = require('../line');
import common = require('./common');
declare class IndentStyleRule implements eclint.LineRule {
    private map;
    private reverseMap;
    check(context: eclint.Context, settings: eclint.Settings, line: _line.Line): void;
    private parseIndentStyle(settings);
    infer(line: _line.Line): common.IndentStyles;
    fix(settings: eclint.Settings, line: _line.Line): _line.Line;
    private repeat(s, n);
}
export = IndentStyleRule;
