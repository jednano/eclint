var common = require('./common');
var IndentStyles = common.IndentStyles;
var IndentStyleRule = (function () {
    function IndentStyleRule() {
    }
    Object.defineProperty(IndentStyleRule.prototype, "map", {
        get: function () {
            return {
                space: '\s',
                tab: '\t'
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndentStyleRule.prototype, "reverseMap", {
        get: function () {
            return {
                '\s': 0 /* space */,
                '\t': 1 /* tab */
            };
        },
        enumerable: true,
        configurable: true
    });
    IndentStyleRule.prototype.check = function (context, settings, line) {
        var indentStyle = this.infer(line);
        var indentStyleSetting = this.parseIndentStyle(settings);
        if (indentStyle && indentStyle !== indentStyleSetting) {
            context.report('Invalid indent style: ' + indentStyle);
        }
    };
    IndentStyleRule.prototype.parseIndentStyle = function (settings) {
        return IndentStyles[IndentStyles[settings.indent_style]];
    };
    IndentStyleRule.prototype.infer = function (line) {
        return this.reverseMap[line[0]];
    };
    IndentStyleRule.prototype.fix = function (settings, line) {
        var indentStyle = this.infer(line);
        var indentStyleSetting = this.parseIndentStyle(settings);
        if (!indentStyle || indentStyle === indentStyleSetting) {
            return line;
        }
        var replace;
        var oneIndent;
        if (indentStyleSetting === 1 /* tab */) {
            replace = this.repeat('\s', settings.tab_width || settings.indent_size || 4);
            oneIndent = '\t';
        }
        else {
            replace = '\t';
            oneIndent = this.repeat('\s', ((settings.indent_size.toString() === 'tab') ? settings.tab_width : settings.indent_size) || 4);
        }
        var replacer = new RegExp('^(?:' + replace + ')+');
        var m = line.Text.match(replacer);
        if (m) {
            var charLength = m[0].length;
        }
        return line;
    };
    IndentStyleRule.prototype.repeat = function (s, n) {
        return new Array(n + 1).join(s);
    };
    return IndentStyleRule;
})();
module.exports = IndentStyleRule;
