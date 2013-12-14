///<reference path='../../vendor/dt-node/node.d.ts'/>
import eclint = require('../eclint');
import _line = require('../line');
import common = require('./common');


class EndOfLineRule implements eclint.LineRule {

	check(context: eclint.Context, settings: eclint.Settings, line: _line.Line): void {
		if (line.Newline && line.Newline.Name !== common.Newlines[settings.end_of_line]) {
			context.report('Incorrect newline character found: ' +
				line.Newline.Name);
		}
	}

	fix(settings: eclint.Settings, line: _line.Line): _line.Line {
		var settingName = common.Newlines[settings.end_of_line];
		if (line.Newline && settingName) {
			line.Newline.Name = settingName;
		}
		return line;
	}

	infer(line: _line.Line): common.Newlines {
		return line.Newline && common.Newlines[line.Newline.Name];
	}
}

export = EndOfLineRule;
