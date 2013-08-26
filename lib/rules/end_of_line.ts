///<reference path='../../vendor/dt-node/node.d.ts'/>
import eclint = require('../eclint');
import _line = require('../line');


export enum Newlines { lf, crlf, cr, ls, ps };

export function check(context: eclint.Context, settings: eclint.Settings,
	line: _line.Line): void {

	if (line.Newline && line.Newline.Name !== Newlines[settings.end_of_line]) {
		context.report('Incorrect newline character found: ' +
			line.Newline.Name);
	}
}

export function fix(settings: eclint.Settings, line: _line.Line): _line.Line {
	var settingName = Newlines[settings.end_of_line];
	if (line.Newline && settingName) {
		line.Newline.Name = settingName;
	}
	return line;
}

export function infer(line: _line.Line): Newlines {
	return line.Newline && Newlines[line.Newline.Name];
}
