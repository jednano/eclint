///<reference path='../typings/node/node.d.ts'/>
///<reference path='../typings/lodash/lodash.d.ts'/>
///<reference path='../typings/vinyl-fs/vinyl-fs.d.ts'/>
var path = require('path');
var _ = require('lodash');
var tap = require('gulp-tap');
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
    cmd.option('-i, --indent_style <style>', 'Set to tab or space');
    cmd.option('-s, --indent_size <n>', 'Set to a whole number or tab');
    cmd.option('-t, --tab_width <n>', 'Columns used to represent a tab character');
    cmd.option('-w, --trim_trailing_whitespace', 'Trims any trailing whitespace');
    cmd.option('-e, --end_of_line <newline>', 'Set to lf, cr, crlf');
    cmd.option('-n, --insert_final_newline', 'Ensures files ends with a newline');
    cmd.option('-m, --max_line_length <n>', 'Set to a whole number');
}
function handleNegativeGlobs(files) {
    return files.map(function (glob) {
        return glob.replace(/^\[!\]/, '!');
    });
}
var check = cli.command('check <files>...');
check.description('Validate that file(s) adhere to .editorconfig settings');
addSettings(check);
check.action(function (args, options) {
    var hasErrors = false;
    var stream = vfs.src(handleNegativeGlobs(args.files.filter(function (file) { return (typeof file === 'string'); }))).pipe(eclint.check({
        settings: _.pick(options, eclint.ruleNames),
        reporter: (function (file, message) {
            hasErrors = true;
            var relativePath = path.relative('.', file.path);
            console.error(relativePath + ':', message);
        })
    })).on('end', function () {
        if (hasErrors) {
            process.exit(1);
        }
    });
    stream.resume();
});
var fix = cli.command('fix <files>...');
fix.description('Fix formatting errors that disobey .editorconfig settings');
addSettings(fix);
fix.option('-d, --dest <folder>', 'Destination folder to pipe source files');
fix.action(function (args, options) {
    var stream = vfs.src(handleNegativeGlobs(args.files.filter(function (file) { return (typeof file === 'string'); }))).pipe(eclint.fix({ settings: _.pick(options, eclint.ruleNames) }));
    if (options.dest) {
        return stream.pipe(vfs.dest(options.dest));
    }
    return stream.pipe(vfs.dest(function (file) {
        return file.base;
    }));
});
var infer = cli.command('infer <files>...');
infer.description('Infer .editorconfig settings from one or more files');
infer.option('-s, --score', 'Shows the tallied score for each setting');
infer.option('-i, --ini', 'Exports file as ini file type');
infer.option('-r, --root', 'Adds root = true to your ini file, if any');
infer.action(function (args, options) {
    return vfs.src(handleNegativeGlobs(args.files.filter(function (file) { return (typeof file === 'string'); }))).pipe(eclint.infer(options)).pipe(tap(function (file) {
        console.log(file.contents + '');
    }));
});
module.exports = cli;
