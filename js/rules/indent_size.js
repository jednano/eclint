///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
var _ = require('lodash');
var IndentSizeRule = {
    type: 'LineRule',
    check: function (context, settings, line) {
        var inferredSetting = this.infer(line);
        if (typeof inferredSetting === 'number' && inferredSetting % settings.indent_size !== 0) {
            context.report('Invalid indent size detected: ' + inferredSetting);
        }
    },
    fix: function (settings, line) {
        var indentSize = applyRule(settings);
        switch (settings.indent_style) {
            case 'tab':
                line.text = line.text.replace(/^ +/, function (match) {
                    var indentLevel = Math.floor(match.length / indentSize);
                    var extraSpaces = _.repeat(' ', match.length % indentSize);
                    return _.repeat('\t', indentLevel) + extraSpaces;
                });
                break;
            case 'space':
                line.text = line.text.replace(/^\t+/, function (match) {
                    return _.repeat(_.repeat(' ', indentSize), match.length);
                });
                break;
            default:
                return line;
        }
        return line;
    },
    infer: function (line) {
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
};
function applyRule(settings) {
    if (settings.indent_size === 'tab') {
        return settings.tab_width;
    }
    return settings.indent_size;
}
module.exports = IndentSizeRule;
