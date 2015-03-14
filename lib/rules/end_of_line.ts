import linez = require('linez');
import eclint = require('../eclint');

class EndOfLineRule implements eclint.LineRule {

	check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
		var lineEndingName = eclint.newlines[line.ending];
		if (lineEndingName && lineEndingName !== settings.end_of_line) {
			context.report('Incorrect newline character found: ' + lineEndingName);
		}
	}

	fix(settings: eclint.Settings, line: linez.Line) {
		var settingName = settings.end_of_line;
		if (line.ending && settingName) {
			line.ending = eclint.newlines[settingName];
		}
		return line;
	}

	infer(line: linez.Line): string {
		return eclint.newlines[line.ending];
	}
}

export = EndOfLineRule;
