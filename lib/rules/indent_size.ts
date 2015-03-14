///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
import _ = require('lodash');
import linez = require('linez');
import eclint = require('../eclint');

class IndentSizeRule implements eclint.LineRule {

	check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
		var inferredSetting = this.infer(line);
		if (typeof inferredSetting === 'number' && inferredSetting % settings.indent_size !== 0) {
			context.report('Invalid indent size detected: ' + inferredSetting);
		}
	}

	fix(settings: eclint.Settings, line: linez.Line) {
		var indentSize = this.applyRule(settings);

		switch (settings.indent_style) {

			case 'tab':
				line.text = line.text.replace(/^ +/, (match: string) => {
					var indentLevel = Math.floor(match.length / indentSize);
					var extraSpaces = _.repeat(' ', match.length % indentSize);
					return _.repeat('\t', indentLevel) + extraSpaces;
				});
				break;

			case 'space':
				line.text = line.text.replace(/^\t+/, (match: string) => {
					return _.repeat(_.repeat(' ', indentSize), match.length);
				});
				break;

			default:
				return line;
		}

		return line;
	}

	infer(line: linez.Line): string|number {
		if (line.text[0] === '\t') {
			return 'tab';
		}

		var m = line.text.match(/^ +/);
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

	private applyRule(settings: eclint.Settings): number {
		if (settings.indent_size === 'tab') {
			return settings.tab_width;
		}
		return settings.indent_size;
	}

}

export = IndentSizeRule;
