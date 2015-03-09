var s = require('../helpers/string');
var DEFAULT_INDENT_SIZE = 4;
var HARD_TAB = '\t';
var IndentStyleRule = (function () {
    function IndentStyleRule() {
    }
    Object.defineProperty(IndentStyleRule.prototype, "reverseMap", {
        get: function () {
            return {
                ' ': 'space',
                '\t': 'tab'
            };
        },
        enumerable: true,
        configurable: true
    });
    IndentStyleRule.prototype.check = function (context, settings, line) {
        var indentStyle = this.infer(line);
        var indentStyleSetting = settings.indent_style;
        if (indentStyle && indentStyleSetting && indentStyle !== indentStyleSetting) {
            context.report('Invalid indent style: ' + indentStyle);
        }
    };
    IndentStyleRule.prototype.infer = function (line) {
        return this.reverseMap[line.Text[0]];
    };
    IndentStyleRule.prototype.fix = function (settings, line) {
        var indentStyle = this.infer(line);
        if (!indentStyle || indentStyle === settings.indent_style) {
            return line;
        }
        var oldIndent;
        var newIndent;
        var softTab = s.repeat(' ', this.resolveIndentSize(settings));
        if (settings.indent_style === 'tab') {
            oldIndent = softTab;
            newIndent = HARD_TAB;
        }
        else {
            oldIndent = HARD_TAB;
            newIndent = softTab;
        }
        var leadingIndentation = new RegExp('^(?:' + oldIndent + ')+');
        line.Text = line.Text.replace(leadingIndentation, function (match) {
            return s.repeat(newIndent, match.length / oldIndent.length);
        });
        return line;
    };
    IndentStyleRule.prototype.resolveIndentSize = function (settings) {
        if (settings.indent_size === 'tab') {
            return settings.tab_width || DEFAULT_INDENT_SIZE;
        }
        return settings.indent_size || settings.tab_width || DEFAULT_INDENT_SIZE;
    };
    return IndentStyleRule;
})();
module.exports = IndentStyleRule;
