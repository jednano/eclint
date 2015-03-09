///<reference path='../bower_components/dt-node/node.d.ts'/>
var checkCommand = require('./commands/check');
var fixCommand = require('./commands/fix');
var inferCommand = require('./commands/infer');
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
var infer = cli.command('infer <files>...');
infer.description('Infer .editorconfig settings from one or more files');
infer.action(inferCommand);
var check = cli.command('check <files>...');
check.description('Validate that file(s) adhere to .editorconfig settings');
check.action(checkCommand);
var fix = cli.command('fix <files>...');
fix.description('Fix formatting errors that disobey .editorconfig settings');
fix.action(fixCommand);
module.exports = cli;
