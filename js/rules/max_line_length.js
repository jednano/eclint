var MaxLineLengthRule = {
    type: 'LineRule',
    check: function (context, settings, line) {
        var inferredSetting = this.infer(line);
        if (inferredSetting > settings.max_line_length) {
            context.report([
                'Line length ' + inferredSetting + ' exceeds max_line_length',
                'setting of ' + settings.max_line_length,
                'on line number ' + line.number
            ].join(' '));
        }
    },
    // ReSharper disable UnusedInheritedParameter
    fix: function (settings, line) {
        throw new Error('Fixing max_line_length setting unsupported');
    },
    infer: function (line) {
        return line.text.length;
    }
};
module.exports = MaxLineLengthRule;
