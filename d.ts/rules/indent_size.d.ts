/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/lodash/lodash.d.ts" />
import linez = require('linez');
import eclint = require('../eclint');
declare class IndentSizeRule implements eclint.LineRule {
    check(context: eclint.Context, settings: eclint.Settings, line: linez.Line): void;
    fix(settings: eclint.Settings, line: linez.Line): linez.Line;
    infer(line: linez.Line): string | number;
    private applyRule(settings);
}
export = IndentSizeRule;
