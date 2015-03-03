import eclint = require('../eclint');
import _line = require('../line');
export declare function check(context: eclint.Context, settings: eclint.Settings, line: _line.Line): void;
export declare function fix(settings: eclint.Settings, line: _line.Line): _line.Line;
export declare function infer(line: _line.Line): boolean;
