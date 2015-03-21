var newlines = {
    lf: '\n',
    '\n': 'lf',
    crlf: '\r\n',
    '\r\n': 'crlf',
    cr: '\r',
    '\r': 'cr'
};
function resolve(settings) {
    switch (settings.end_of_line) {
        case 'lf':
        case 'crlf':
        case 'cr':
            return settings.end_of_line;
        default:
            return void (0);
    }
}
function check(context, settings, line) {
    var configSetting = resolve(settings);
    if (!configSetting) {
        return;
    }
    var inferredSetting = infer(line);
    if (!inferredSetting) {
        return;
    }
    if (inferredSetting !== configSetting) {
        context.report([
            'line ' + line.number + ':',
            'invalid newline: ' + inferredSetting + ',',
            'expected: ' + configSetting
        ].join(' '));
    }
}
function fix(settings, line) {
    var configSetting = resolve(settings);
    if (line.ending && configSetting) {
        line.ending = newlines[configSetting];
    }
    return line;
}
function infer(line) {
    return newlines[line.ending];
}
var EndOfLineRule = {
    type: 'LineRule',
    resolve: resolve,
    check: check,
    fix: fix,
    infer: infer
};
module.exports = EndOfLineRule;
