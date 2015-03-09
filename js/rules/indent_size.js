var s = require('../helpers/string');
var IndentSizeRule = (function () {
    function IndentSizeRule() {
    }
    IndentSizeRule.prototype.check = function (context, settings, line) {
        var inferredSetting = this.infer(line);
        if (inferredSetting && inferredSetting % settings.indent_size !== 0) {
            context.report('Invalid indent size detected: ' + inferredSetting);
        }
    };
    IndentSizeRule.prototype.infer = function (line) {
        if (line.Text[0] === '\t') {
            return 'tab';
        }
        var m = line.Text.match(/^ +/);
        if (m) {
            var leadingSpacesLength = m[0].length;
            for (var i = 8; i > 0; i--) {
                if (leadingSpacesLength % i === 0) {
                    return i;
                }
            }
        }
        return 0;
    };
    IndentSizeRule.prototype.fix = function (settings, line) {
        var indentSize = this.applyRule(settings);
        switch (settings.indent_style) {
            case 'tab':
                line.Text = line.Text.replace(/^ +/, function (match) {
                    var indentLevel = Math.floor(match.length / indentSize);
                    var extraSpaces = s.repeat(' ', match.length % indentSize);
                    return s.repeat('\t', indentLevel) + extraSpaces;
                });
                break;
            case 'space':
                line.Text = line.Text.replace(/^\t+/, function (match) {
                    return s.repeat(s.repeat(' ', indentSize), match.length);
                });
                break;
            default:
                return line;
        }
        return line;
    };
    IndentSizeRule.prototype.applyRule = function (settings) {
        if (settings.indent_size === 'tab') {
            return settings.tab_width;
        }
        return settings.indent_size;
    };
    return IndentSizeRule;
})();
module.exports = IndentSizeRule;
