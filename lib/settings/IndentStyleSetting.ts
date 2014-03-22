import Setting = require('./Setting');
import IndentationRule = require('../rules/IndentationRule');


class IndentStyleSetting extends Setting {

	static toString() {
		return 'indent_style';
	}

	get rule() {
		return IndentationRule;
	}

	parse(indentStyle: any): string {
		switch (indentStyle) {
			case 'tab':
			case 'space':
				return indentStyle;
			default:
				this.warn('Unsupported indent_style: ' + indentStyle);
		}
		// ReSharper disable once NotAllPathsReturnValue
	}

}

export = IndentStyleSetting;
