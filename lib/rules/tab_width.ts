import eclint = require('../eclint');
import _line = require('../line');

class TabWidthRule implements eclint.LineRule {

	check(context: eclint.Context, settings: eclint.Settings, line: _line.Line):
		void {
		return;
	}

	fix(settings: eclint.Settings, line: _line.Line): _line.Line {
		return line;
	}

	infer(line: _line.Line): number {
		throw new Error('Tab width cannot be inferred');
	}

}

export = TabWidthRule;
