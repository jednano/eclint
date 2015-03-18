///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
var _ = require('lodash');
var DEFAULT_INDENT_SIZE = 4;
var HARD_TAB = '\t';
var IndentStyleRule = {
    type: 'LineRule',
    check: function (context, settings, line) {
        if (typeof settings.indent_style === 'undefined') {
            return;
        }
        var inferredSetting = this.infer(line);
        if (typeof inferredSetting === 'undefined') {
            return;
        }
        if (inferredSetting !== settings.indent_style) {
            context.report('Invalid indent style: ' + inferredSetting);
        }
    },
    fix: function (settings, line) {
        var indentStyle = this.infer(line);
        if (!indentStyle || indentStyle === settings.indent_style) {
            return line;
        }
        var oldIndent;
        var newIndent;
        var softTab = _.repeat(' ', resolveIndentSize(settings));
        if (settings.indent_style === 'tab') {
            oldIndent = softTab;
            newIndent = HARD_TAB;
        }
        else {
            oldIndent = HARD_TAB;
            newIndent = softTab;
        }
        var leadingIndentation = new RegExp('^(?:' + oldIndent + ')+');
        line.text = line.text.replace(leadingIndentation, function (match) {
            return _.repeat(newIndent, match.length / oldIndent.length);
        });
        return line;
    },
    infer: function (line) {
        return reverseMap[line.text[0]];
    }
};
var reverseMap = {
    ' ': 'space',
    '\t': 'tab'
};
function resolveIndentSize(settings) {
    if (settings.indent_size === 'tab') {
        return settings.tab_width || DEFAULT_INDENT_SIZE;
    }
    return settings.indent_size || settings.tab_width || DEFAULT_INDENT_SIZE;
}
module.exports = IndentStyleRule;
