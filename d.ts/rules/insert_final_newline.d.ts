import linez = require('linez');
import eclint = require('../eclint');
declare class InsertFinalNewlineRule implements eclint.DocumentRule {
    check(context: eclint.Context, settings: eclint.Settings, doc: linez.Document): void;
    fix(settings: eclint.Settings, doc: linez.Document): linez.Document;
    infer(doc: linez.Document): boolean;
}
export = InsertFinalNewlineRule;
