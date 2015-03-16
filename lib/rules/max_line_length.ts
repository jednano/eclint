import linez = require('linez');
import eclint = require('../eclint');

function check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
	var inferredSetting = infer(line);
	if (inferredSetting > settings.max_line_length) {
		context.report([
			'Line length ' + inferredSetting + ' exceeds max_line_length',
			'setting of ' + settings.max_line_length,
			'on line number ' + line.number
		].join(' '));
	}
}

// ReSharper disable UnusedInheritedParameter
function fix(settings: eclint.Settings, line: linez.Line): linez.Line {
	// ReSharper restore UnusedInheritedParameter
	throw new Error('Fixing max_line_length setting unsupported');
}

function infer(line: linez.Line) {
	return line.text.length;
}

var MaxLineLengthRule: eclint.LineRule = {
	type: 'LineRule',
	check: check,
	fix: fix,
	infer: infer
};

export = MaxLineLengthRule;
