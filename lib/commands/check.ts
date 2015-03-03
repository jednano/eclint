var editorconfig = require('editorconfig');
var fs = require('fs');
var path = require('path');

function check(args, options, callback) {

	if (typeof callback !== 'function') {
		callback = () => {
			// TODO
		};
	}

	if (typeof options === 'function') {
		callback = options;
		options = {};
	}

	var messages = [];
	var files = args.files;

	if (!files || !files.length) {
		callback();
	}

	var count = 0;

	files.forEach(filename => {
		var settings = editorconfig.parse(filename);
		var reporter = {
			report: msg => {
				messages.push({
					filename: filename,
					msg: msg
				});
			}
		};

		var ruleNames = Object.keys(settings);
		ruleNames.forEach(ruleName => {
			var rule = require('../rules/' + ruleName);
			var setting = settings[ruleName];

			fs.readFile(filename, {encoding: 'utf8'}, (err, data) => {
				if (err) {
					throw err;
				}
				rule.check(reporter, setting, data);

				if (++count === files.length * ruleNames.length) {
					done();
				}
			});
		});
	});

	function done() {
		if (!options.boring) {
			messages.forEach(message => {
				console.log(message.filename + ':', message.msg);
			});
		}
		return callback(messages);
	}
}

export = check;
