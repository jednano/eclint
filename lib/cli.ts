///<reference path='../typings/node/node.d.ts'/>
///<reference path='../typings/vinyl-fs/vinyl-fs.d.ts'/>
import eclint = require('./eclint');
import vfs = require('vinyl-fs');

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

cli.version(pkg.version);
cli.description(pkg.description);

function addOptions(cmd): void {
	cmd.option('-c, --charset',                  'Set to latin1, utf-8, utf-8-bom (see docs)');
	cmd.option('-s, --indent_style',             'Set to tab or space');
	cmd.option('-z, --indent_size',              'Set to a whole number or tab');
	cmd.option('-t, --tab_width',                'Columns used to represent a tab character');
	cmd.option('-w, --trim_trailing_whitespace', 'Trims any trailing whitespace');
	cmd.option('-e, --end_of_line',              'Set to lf, cr, crlf');
	cmd.option('-n, --insert_final_newline',     'Set to true or false');
	cmd.option('-m, --max-line-length',          'Set to a whole number');
}

function wrap(method: eclint.Command): eclint.Command {
	return (args: any, options?: eclint.CommandOptions) => {
		return vfs.src(args.files)
			.pipe(method({ settings: options }))
			.pipe(vfs.dest('dist'));
	};
}

var infer = cli.command('infer <files>...');
addOptions(infer);
infer.description('Infer .editorconfig settings from one or more files');
infer.action(wrap(eclint.infer));

var check = cli.command('check <files>...');
addOptions(check);
check.description('Validate that file(s) adhere to .editorconfig settings');
check.action(wrap(eclint.check));

var fix = cli.command('fix <files>...');
addOptions(fix);
fix.description('Fix formatting errors that disobey .editorconfig settings');
fix.action(wrap(eclint.fix));

export = cli;
