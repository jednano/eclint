var MaxLineLengthRule = (function () {
    function MaxLineLengthRule() {
    }
    MaxLineLengthRule.prototype.check = function (context, settings, line) {
        var lineLength = line.Text.length;
        if (lineLength > settings.max_line_length) {
            context.report([
                'Line length ' + lineLength + ' exceeds max_line_length',
                'setting of ' + settings.max_line_length,
                'on line number ' + line.Number
            ].join(' '));
        }
    };
    MaxLineLengthRule.prototype.fix = function (settings, line) {
        throw new Error('Fixing max_line_length setting unsupported');
    };
    MaxLineLengthRule.prototype.infer = function (line) {
        return line.Text.length;
    };
    return MaxLineLengthRule;
})();
module.exports = MaxLineLengthRule;
