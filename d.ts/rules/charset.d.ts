/// <reference path="../../typings/lodash/lodash.d.ts" />
import linez = require('linez');
import eclint = require('../eclint');
declare class CharsetRule implements eclint.DocumentRule {
    check(context: eclint.Context, settings: eclint.Settings, doc: linez.Document): void;
    fix(settings: eclint.Settings, doc: linez.Document): linez.Document;
    infer(doc: linez.Document): string;
}
export = CharsetRule;
