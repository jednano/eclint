function check(context, settings, line) {
    var inferredSetting = infer(line);
    if (inferredSetting > settings.max_line_length) {
        context.report([
            'Line length ' + inferredSetting + ' exceeds max_line_length',
            'setting of ' + settings.max_line_length,
            'on line number ' + line.number
        ].join(' '));
    }
}
// ReSharper disable UnusedInheritedParameter
function fix(settings, line) {
    throw new Error('Fixing max_line_length setting unsupported');
}
function infer(line) {
    return line.text.length;
}
var MaxLineLengthRule = {
    type: 'LineRule',
    check: check,
    fix: fix,
    infer: infer
};
module.exports = MaxLineLengthRule;
