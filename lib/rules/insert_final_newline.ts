import eclint = require('../eclint');
import _line = require('../line');
import Newline = require('../Newline');

class InsertFinalNewlineRule implements eclint.LinesRule {

	check(context: eclint.Context, settings: eclint.Settings, lines: _line.Line[]): void {
		if (settings.insert_final_newline && !this.infer(lines)) {
			context.report('Expected final newline character');
			return;
		}
		if (settings.insert_final_newline === false && this.infer(lines)) {
			context.report('Unexpected final newline character');
		}
	}

	fix(settings: eclint.Settings, lines: _line.Line[]): _line.Line[] {
		var lastLine: _line.Line;
		if (settings.insert_final_newline && !this.infer(lines)) {
			lastLine = lines[lines.length - 1];
			var endOfLineSetting = settings.end_of_line || 'lf';
			if (lastLine) {
				lastLine.Newline = new Newline(Newline.map[endOfLineSetting]);
			} else {
				lines.push(new _line.Line('', {
					newline: endOfLineSetting
				}));
			}
			return lines;
		}
		if (!settings.insert_final_newline) {
			while (this.infer(lines)) {
				lastLine = lines[lines.length - 1];
				if (lastLine.Text) {
					lastLine.Newline = void (0);
					break;
				}
				lines.pop();
			}
			return lines;
		}
		return lines;
	}

	infer(lines: _line.Line[]): boolean {
		var lastLine = lines[lines.length - 1];
		return lastLine ? !!lastLine.Newline : false;
	}

}

export = InsertFinalNewlineRule;
