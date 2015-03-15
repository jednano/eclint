var MaxLineLengthRule = {
    type: 'LineRule',
    check: function (context, settings, line) {
        var lineLength = line.text.length;
        if (lineLength > settings.max_line_length) {
            context.report([
                'Line length ' + lineLength + ' exceeds max_line_length',
                'setting of ' + settings.max_line_length,
                'on line number ' + line.number
            ].join(' '));
        }
    },
    fix: function () {
        throw new Error('Fixing max_line_length setting unsupported');
    },
    infer: function (line) {
        return line.text.length;
    }
};
module.exports = MaxLineLengthRule;
