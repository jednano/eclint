import linez = require('linez');
import eclint = require('../eclint');

var MaxLineLengthRule: eclint.LineRule = {

	type: 'LineRule',

	check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
		var lineLength = line.text.length;
		if (lineLength > settings.max_line_length) {
			context.report([
				'Line length ' + lineLength + ' exceeds max_line_length',
				'setting of ' + settings.max_line_length,
				'on line number ' + line.number
			].join(' '));
		}
	},

	fix(): linez.Line {
		throw new Error('Fixing max_line_length setting unsupported');
	},

	infer(line: linez.Line) {
		return line.text.length;
	}

};

export = MaxLineLengthRule;
