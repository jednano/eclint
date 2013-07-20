var trailingWhitespacePat = /[\t ]+(?=[\r\n])/g;

function hasTrailingWhitespace(s) {
    return s.match(trailingWhitespacePat) !== null;
}

exports.check = function(context, setting, data) {
    if (setting && hasTrailingWhitespace(data)) {
        context.report('Trailing whitespace found.');
    }
};

exports.fix = function(setting, data) {
    if (setting) {
        return data.replace(trailingWhitespacePat, '');
    }
    return data;
};

exports.infer = function(data) {
    return !hasTrailingWhitespace(data);
};
