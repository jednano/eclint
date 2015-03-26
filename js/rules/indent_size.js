///<reference path="../../typings/node/node.d.ts" />
///<reference path="../../typings/lodash/lodash.d.ts" />
var _ = require('lodash');
var LEADING_SPACES_MATCHER = /^ +/;
function resolve(settings) {
    var result = (settings.indent_size === 'tab') ? settings.tab_width : settings.indent_size;
    if (!_.isNumber(result)) {
        result = settings.tab_width;
    }
    return _.isNumber(result) ? result : void (0);
}
function check(context, settings, doc) {
    if (settings.indent_style === 'tab') {
        return;
    }
    var configSetting = resolve(settings);
    if (_.isUndefined(configSetting)) {
        return;
    }
    doc.lines.forEach(function (line) {
        var leadingSpacesLength = getLeadingSpacesLength(line);
        if (_.isUndefined(leadingSpacesLength)) {
            return;
        }
        if (configSetting === 0) {
            return;
        }
        if (leadingSpacesLength % configSetting !== 0) {
            context.report([
                'line ' + line.number + ':',
                'invalid indent size: ' + leadingSpacesLength + ',',
                'expected: ' + configSetting
            ].join(' '));
        }
    });
}
function getLeadingSpacesLength(line) {
    if (line.text[0] === '\t') {
        return void (0);
    }
    var m = line.text.match(LEADING_SPACES_MATCHER);
    return (m) ? m[0].length : 0;
}
function fix(settings, doc) {
    return doc; // noop
}
function infer(doc) {
    var scores = {};
    function vote(indentSize) {
        scores[indentSize] = scores[indentSize] || 0;
        scores[indentSize]++;
    }
    var lastLineLeadingSpacesLength = 0;
    doc.lines.forEach(function (line) {
        var leadingSpacesLength = getLeadingSpacesLength(line);
        if (_.isUndefined(leadingSpacesLength)) {
            return;
        }
        vote(Math.abs(leadingSpacesLength - lastLineLeadingSpacesLength));
        lastLineLeadingSpacesLength = leadingSpacesLength;
    });
    var bestScore = 0;
    var result = 0;
    Object.keys(scores).forEach(function (indentSize) {
        var score = scores[indentSize];
        if (score > bestScore) {
            bestScore = score;
            result = +indentSize;
        }
    });
    return result;
}
var IndentSizeRule = {
    type: 'DocumentRule',
    resolve: resolve,
    check: check,
    fix: fix,
    infer: infer
};
module.exports = IndentSizeRule;
