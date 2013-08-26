///<reference path='../../vendor/dt-node/node.d.ts'/>
import eclint = require('../eclint');
import _line = require('../line');


export function check(context: eclint.Context, settings: eclint.Settings,
	line: _line.Line): void {

	if (isSettingTrue(settings) && trailingWhitespace.test(line.Text)) {
		context.report('Trailing whitespace found.');
	}
}

export function fix(settings: eclint.Settings, line: _line.Line): _line.Line {
	if (isSettingTrue(settings)) {
		line.Text = line.Text.replace(trailingWhitespace, '');
	}
	return line;
}

export function infer(line: _line.Line): boolean {
	return !trailingWhitespace.test(line.Text);
}

var trailingWhitespace = /\s+$/;

function isSettingTrue(settings) {
	return settings.trim_trailing_whitespace === true;
}
