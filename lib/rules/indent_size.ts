import eclint = require('../eclint');
import _line = require('../line');
import s = require('../helpers/string');

class IndentSizeRule implements eclint.LineRule {

	check(context: eclint.Context, settings: eclint.Settings, line: _line.Line): void {
		var inferredSetting = this.infer(line);
		if (inferredSetting && inferredSetting % settings.indent_size !== 0) {
			context.report('Invalid indent size detected: ' + inferredSetting);
		}
	}

	infer(line: _line.Line): any {
		if (line.Text[0] === '\t') {
			return 'tab';
		}

		var m = line.Text.match(/^ +/);
		if (m) {
			var leadingSpacesLength = m[0].length;
			for (var i = 8; i > 0; i--) {
				if (leadingSpacesLength % i === 0) {
					return i;
				}
			}
		}

		return 0;
	}

	fix(settings: eclint.Settings, line: _line.Line): _line.Line {
		var indentSize = this.applyRule(settings);

		switch (settings.indent_style) {

			case 'tab':
				line.Text = line.Text.replace(/^ +/, (match: string) => {
					var indentLevel = Math.floor(match.length / indentSize);
					var extraSpaces = s.repeat(' ', match.length % indentSize);
					return s.repeat('\t', indentLevel) + extraSpaces;
				});
				break;

			case 'space':
				line.Text = line.Text.replace(/^\t+/, (match: string) => {
					return s.repeat(s.repeat(' ', indentSize), match.length);
				});
				break;

			default:
				return line;
		}

		return line;
	}

	private applyRule(settings: eclint.Settings): number {
		if (settings.indent_size === 'tab') {
			return settings.tab_width;
		}
		return settings.indent_size;
	}

}

export = IndentSizeRule;
