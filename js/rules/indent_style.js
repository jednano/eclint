var _ = require('lodash');
var DEFAULT_INDENT_SIZE = 4;
var HARD_TAB = '\t';
function parse(settings) {
    switch (settings.indent_style) {
        case 'tab':
        case 'space':
            return settings.indent_style;
        default:
            return void (0);
    }
}
function check(context, settings, line) {
    var inferredSetting = infer(line);
    var setting = parse(settings);
    if (inferredSetting && setting && inferredSetting !== setting) {
        context.report([
            'line ' + line.number + ':',
            'invalid indent style: ' + inferredSetting + ',',
            'expected: ' + setting
        ].join(' '));
    }
}
function fix(settings, line) {
    var indentStyle = infer(line);
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
}
function infer(line) {
    return reverseMap[line.text[0]];
}
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
var IndentStyleRule = {
    type: 'LineRule',
    parse: parse,
    check: check,
    fix: fix,
    infer: infer
};
module.exports = IndentStyleRule;
