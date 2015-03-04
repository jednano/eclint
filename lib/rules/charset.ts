import _line = require('../line');
import eclint = require('../eclint');

class CharsetRule implements eclint.LineRule {

	check(context: eclint.Context, settings: eclint.Settings, line: _line.Line):
	    void {

		checkByteOrderMark(context, settings, line);
		checkLatin1TextRange(context, settings, line);
	}

	fix(settings: eclint.Settings, line: _line.Line): _line.Line {
		var setting = settings.charset;
		if (setting) {
			line.Charsets = setting;
		}
		return line;
	}

	infer(line: _line.Line): string {
		return line.Charsets;
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
