import linez = require('linez');
import eclint = require('../eclint');

var InsertFinalNewlineRule: eclint.DocumentRule = {

	type: 'DocumentRule',

	check(context: eclint.Context, settings: eclint.Settings, doc: linez.Document) {
		if (settings.insert_final_newline && !this.infer(doc)) {
			context.report('Expected final newline character');
			return;
		}
		if (settings.insert_final_newline === false && this.infer(doc)) {
			context.report('Unexpected final newline character');
		}
	},

	fix(settings: eclint.Settings, doc: linez.Document) {
		var lastLine: linez.Line;
		if (settings.insert_final_newline && !this.infer(doc)) {
			lastLine = doc.lines[doc.lines.length - 1];
			var endOfLineSetting = settings.end_of_line || 'lf';
			if (lastLine) {
				lastLine.ending = eclint.newlines[endOfLineSetting];
			} else {
				doc.lines.push({
					number: 1,
					text: '',
					ending: eclint.newlines[endOfLineSetting],
					offset: 0
				});
			}
			return doc;
		}
		if (!settings.insert_final_newline) {
			while (this.infer(doc)) {
				lastLine = doc.lines[doc.lines.length - 1];
				if (lastLine.text) {
					lastLine.ending = void (0);
					break;
				}
				doc.lines.pop();
			}
			return doc;
		}
		return doc;
	},

	infer(doc: linez.Document) {
		var lastLine = doc.lines[doc.lines.length - 1];
		if (lastLine && lastLine.ending) {
			return true;
		}
		return false;
	}

};

export = InsertFinalNewlineRule;
