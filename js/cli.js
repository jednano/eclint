///<reference path='../typings/node/node.d.ts'/>
///<reference path='../typings/lodash/lodash.d.ts'/>
///<reference path='../typings/vinyl-fs/vinyl-fs.d.ts'/>
var _ = require('lodash');
var vfs = require('vinyl-fs');
var eclint = require('./eclint');
var clc = require('cli-color');
var cli = require('gitlike-cli');
var pkg = require('../package');
cli.on('error', function (err) {
    console.log('');
    console.log(clc.red('  ' + err.name + ':', err.message));
    err.command.outputUsage();
    err.command.outputCommands();
    err.command.outputOptions();
    console.log();
    process.exit(1);
});
cli.version(pkg.version);
cli.description(pkg.description);
function addSettings(cmd) {
    cmd.option('-c, --charset <charset>', 'Set to latin1, utf-8, utf-8-bom (see docs)');
    cmd.option('-s, --indent_style <style>', 'Set to tab or space');
    cmd.option('-z, --indent_size <n>', 'Set to a whole number or tab');
    cmd.option('-t, --tab_width <n>', 'Columns used to represent a tab character');
    cmd.option('-w, --trim_trailing_whitespace', 'Trims any trailing whitespace');
    cmd.option('-e, --end_of_line <newline>', 'Set to lf, cr, crlf');
    cmd.option('-n, --insert_final_newline', 'Ensures files ends with a newline');
    cmd.option('-m, --max_line_length <n>', 'Set to a whole number');
}
var check = cli.command('check <files>...');
check.description('Validate that file(s) adhere to .editorconfig settings');
addSettings(check);
check.action(function (args, options) {
    var stream = vfs.src(args.files);
    stream.pipe(eclint.check({ settings: _.pick(options, eclint.ruleNames) }));
    return stream;
});
var fix = cli.command('fix <files>...');
fix.description('Fix formatting errors that disobey .editorconfig settings');
addSettings(fix);
fix.option('-d, --dest <folder>', 'Destination folder to pipe source files');
fix.action(function (args, options) {
    var stream = vfs.src(args.files);
    stream.pipe(eclint.fix({ settings: _.pick(options, eclint.ruleNames) }));
    if (options.dest) {
        stream.pipe(vfs.dest(options.dest));
    }
    return stream;
});
var infer = cli.command('infer <files>...');
infer.description('Infer .editorconfig settings from one or more files');
infer.option('-o, --output', 'File to output inferred settings');
infer.action(function (args, options) {
    var stream = vfs.src(args.files);
    stream.pipe(eclint.infer({ settings: _.pick(options, eclint.ruleNames) }));
    if (options.output) {
        stream.pipe(vfs.dest(options.output));
    }
    else {
        console.log('foo');
    }
    return stream;
});
module.exports = cli;
