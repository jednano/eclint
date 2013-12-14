///<reference path='../vendor/dt-node/node.d.ts'/>
var clc = require('cli-color');
var cli = require('gitlike-cli');
var pkg = require('../package');


cli.on('error', err => {
	console.log('');
	console.log(clc.red('  ' + err.name + ':', err.message));
	err.command.outputUsage();
	err.command.outputCommands();
	err.command.outputOptions();
	console.log();
	process.exit(1);
});

cli

	.version(pkg.version)
	.description(pkg.description)

	.command('infer <files>...')
	    .description('Infer .editorconfig settings from one or more files')
	    .action(require('./commands/infer'))
	    .parent

	.command('check <files>...')
	    .description('Validate that file(s) adhere to .editorconfig settings')
	    .action(require('./commands/check'))
	    .parent

	.command('fix <files>...')
	    .description('Fix formatting errors that disobey .editorconfig settings')
	    .action(require('./commands/fix'))
	    .parent;

export = cli;
