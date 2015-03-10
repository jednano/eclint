import _line = require('../line');
import eclint = require('../eclint');

class CharsetRule implements eclint.LinesRule {

	check(context: eclint.Context, settings: eclint.Settings, lines: _line.Line[]): void {
		var firstLine = lines[0];
		if (!firstLine) {
			return;
		}
		checkByteOrderMark(context, settings, firstLine);
		checkLatin1TextRange(context, settings, firstLine);
	}

	fix(settings: eclint.Settings, lines: _line.Line[]): _line.Line[] {
		var firstLine = lines[0];
		if (!firstLine || firstLine.Number !== 1) {
			return lines;
		}
		var setting = settings.charset;
		if (setting) {
			firstLine.Charsets = setting;
		}
		return lines;
	}

	infer(lines: _line.Line[]): string {
		var firstLine = lines[0];
		return firstLine && firstLine.Charsets;
	}
}

function checkByteOrderMark(context: eclint.Context, settings: eclint.Settings,
	line: _line.Line) {

	var charset = settings.charset;
	if (line.Charsets) {
		if (charset && charset !== line.Charsets) {
			context.report('Invalid charset: ' +
			    line.Charsets.replace(/_/g, '-'));
		}
	} else if (line.Number === 1 && charset) {
		context.report('Expected charset: ' + charset);
	}
}

function checkLatin1TextRange(context: eclint.Context,
	settings: eclint.Settings, line: _line.Line) {

	if (settings.charset !== 'latin1') {
		return;
	}
	var text = line.Text;
	for (var i = 0, len = text.length; i < len; i++) {
		var character = text[i];
		if (character.charCodeAt(0) >= 0x80) {
			context.report('Character out of latin1 range: ' + character);
		}
	}
}

export = CharsetRule;
