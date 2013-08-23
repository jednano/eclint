var editorconfig = require('editorconfig');
var fs = require('fs');
var path = require('path');


module.exports = function(args, options, callback) {

    if (typeof callback !== 'function') {
        callback = function() {};
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

    files.forEach(function(filename) {
        var settings = editorconfig.parse(filename);
        var reporter = {
            report: function(msg) {
                messages.push({
                    filename: filename,
                    msg: msg
                });
            }
        };

        var ruleNames = Object.keys(settings);
        ruleNames.forEach(function(ruleName) {
            var rule = require('../rules/' + ruleName);
            var setting = settings[ruleName];

            fs.readFile(filename, {encoding: 'utf8'}, function(err, data) {
                if (err) throw err;
                rule.check(reporter, setting, data);

                if (++count === files.length * ruleNames.length) {
                    done();
                }
            });
        });
    });

    function done() {
        if (!options.boring) {
            messages.forEach(function(message) {
                console.log(message.filename + ':', message.msg);
            });
        }
        return callback(messages);
    }
};
