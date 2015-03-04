import eclint = require('../eclint');
import _line = require('../line');

class InsertFinalNewlineRule implements eclint.LinesRule {

	check(context: eclint.Context, settings: eclint.Settings, lines: _line.Line[]): void {
		if (this.infer(lines)) {
			if (!settings.insert_final_newline) {
				context.report('Expected final newline character');
			}
		} else if (settings.insert_final_newline) {
			context.report('Unexpected final newline character');
		}
	}

	fix(settings: eclint.Settings, lines: _line.Line[]): _line.Line[] {
		if (this.infer(lines)) {
			if (!settings.insert_final_newline) {
				lines.push(new _line.Line('', {
					newline: settings.end_of_line
				}));
			}
		} else if (settings.insert_final_newline) {
			lines.pop();
		}
		return lines;
	}

	infer(lines: _line.Line[]): boolean {
		var lastLine = lines[lines.length - 1];
		if (lastLine.Text === '' && lastLine.Newline.Length === 0) {
			return true;
		}
		return false;
	}

}

export = InsertFinalNewlineRule;
