///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
import _ = require('lodash');
import linez = require('linez');
import eclint = require('../eclint');

var DEFAULT_INDENT_SIZE = 4;
var HARD_TAB = '\t';

class IndentStyleRule implements eclint.LineRule {

	private get reverseMap() {
		return {
			' ': 'space',
			'\t': 'tab'
		};
	}

	check(context: eclint.Context, settings: eclint.Settings, line: linez.Line) {
		var indentStyle = this.infer(line);
		var indentStyleSetting = settings.indent_style;
		if (indentStyle && indentStyleSetting && indentStyle !== indentStyleSetting) {
			context.report('Invalid indent style: ' + indentStyle);
		}
	}

	fix(settings: eclint.Settings, line: linez.Line) {
		var indentStyle = this.infer(line);

		if (!indentStyle || indentStyle === settings.indent_style) {
			return line;
		}

		var oldIndent: string;
		var newIndent: string;
		var softTab = _.repeat(' ', this.resolveIndentSize(settings));
		if (settings.indent_style === 'tab') {
			oldIndent = softTab;
			newIndent = HARD_TAB;
		} else {
			oldIndent = HARD_TAB;
			newIndent = softTab;
		}

		var leadingIndentation = new RegExp('^(?:' + oldIndent + ')+');
		line.text = line.text.replace(leadingIndentation, match => {
			return _.repeat(newIndent, match.length / oldIndent.length);
		});

		return line;
	}

	infer(line: linez.Line) {
		return this.reverseMap[line.text[0]];
	}

	private resolveIndentSize(settings: eclint.Settings) {
		if (settings.indent_size === 'tab') {
			return settings.tab_width || DEFAULT_INDENT_SIZE;
		}
		return settings.indent_size || settings.tab_width || DEFAULT_INDENT_SIZE;
	}

}

export = IndentStyleRule;
