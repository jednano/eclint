/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/lodash/lodash.d.ts" />
import linez = require('linez');
import eclint = require('../eclint');
declare class IndentStyleRule implements eclint.LineRule {
    private reverseMap;
    check(context: eclint.Context, settings: eclint.Settings, line: linez.Line): void;
    fix(settings: eclint.Settings, line: linez.Line): linez.Line;
    infer(line: linez.Line): any;
    private resolveIndentSize(settings);
}
export = IndentStyleRule;
