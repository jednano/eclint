import eclint = require('../eclint');
import _line = require('../line');

class MaxLineLengthRule implements eclint.LineRule {

	check(context: eclint.Context, settings: eclint.Settings, line: _line.Line):
		void {

		var lineLength = line.Text.length;
		if (lineLength > settings.max_line_length) {
			context.report([
				'Line length ' + lineLength + ' exceeds max_line_length',
				'setting of ' + settings.max_line_length,
				'on line number ' + line.Number
			].join(' '));
		}
	}

	fix(settings: eclint.Settings, line: _line.Line): _line.Line {
		throw new Error('Fixing max_line_length setting unsupported');
	}

	infer(line: _line.Line): number {
		return line.Text.length;
	}

}

export = MaxLineLengthRule;
