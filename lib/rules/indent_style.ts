import eclint = require('../eclint');
import _line = require('../line');
import common = require('./common');
var IndentStyles = common.IndentStyles;

class IndentStyleRule implements eclint.LineRule {

	private get map(): eclint.HashTable<string> {
		return {
			space: '\s',
			tab: '\t'
		};
	}

	private get reverseMap(): eclint.HashTable<common.IndentStyles> {
		return {
			'\s': IndentStyles.space,
			'\t': IndentStyles.tab
		};
	}

	check(context: eclint.Context, settings: eclint.Settings, line: _line.Line): void {

		var indentStyle = this.infer(line);
		var indentStyleSetting = this.parseIndentStyle(settings);

		if (indentStyle && indentStyle !== indentStyleSetting) {
			context.report('Invalid indent style: ' + indentStyle);
		}
	}

	private parseIndentStyle(settings): common.IndentStyles {
		return IndentStyles[IndentStyles[settings.indent_style]];
	}

	infer(line: _line.Line): common.IndentStyles {
		return this.reverseMap[line[0]];
	}

	fix(settings: eclint.Settings, line: _line.Line): _line.Line {
		var indentStyle = this.infer(line);
		var indentStyleSetting = this.parseIndentStyle(settings);

		if (!indentStyle || indentStyle === indentStyleSetting) {
			return line;
		}

		var replace: string;
		var oneIndent: string;
		if (indentStyleSetting === IndentStyles.tab) {
			replace = this.repeat('\s', settings.tab_width || settings.indent_size || 4);
			oneIndent = '\t';

		} else {
			replace = '\t';
			oneIndent = this.repeat('\s',
			(
				(settings.indent_size.toString() === 'tab')
					? settings.tab_width
					: settings.indent_size
			) || 4);
		}
		var replacer = new RegExp('^(?:' + replace + ')+');
		var m = line.Text.match(replacer);
		if (m) {
			var charLength = m[0].length;
		}
		return line;
	}

	private repeat(s: string, n: number) {
		return new Array(n + 1).join(s);
	}

}

export = IndentStyleRule;
