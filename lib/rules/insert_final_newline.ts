import linez = require('linez');
import eclint = require('../eclint');

var newlines = {
	lf: '\n',
	crlf: '\r\n',
	cr: '\r'
};

function check(context: eclint.Context, settings: eclint.Settings, doc: linez.Document) {
	if (settings.insert_final_newline && !infer(doc)) {
		context.report('Expected final newline character');
		return;
	}
	if (settings.insert_final_newline === false && infer(doc)) {
		context.report('Unexpected final newline character');
	}
}

function fix(settings: eclint.Settings, doc: linez.Document) {
	var lastLine: linez.Line;
	if (settings.insert_final_newline && !infer(doc)) {
		lastLine = doc.lines[doc.lines.length - 1];
		var endOfLineSetting = settings.end_of_line || 'lf';
		if (lastLine) {
			lastLine.ending = newlines[endOfLineSetting];
		} else {
			doc.lines.push({
				number: 1,
				text: '',
				ending: newlines[endOfLineSetting],
				offset: 0
			});
		}
		return doc;
	}
	if (!settings.insert_final_newline) {
		while (infer(doc)) {
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
}

function infer(doc: linez.Document) {
	var lastLine = doc.lines[doc.lines.length - 1];
	if (lastLine && lastLine.ending) {
		return true;
	}
	return false;
}

var InsertFinalNewlineRule: eclint.DocumentRule = {
	type: 'DocumentRule',
	check: check,
	fix: fix,
	infer: infer
};

export = InsertFinalNewlineRule;
