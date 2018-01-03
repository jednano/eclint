import * as fileType from 'file-type';
import * as fs from 'fs';
import * as excludeGitignore from 'gulp-exclude-gitignore';
import * as filter from 'gulp-filter';
import * as reporter from 'gulp-reporter';
import * as tap from 'gulp-tap';
import * as _ from 'lodash';
import * as minimatch from 'minimatch';
import * as path from 'path';
import * as Stream from 'stream';
import * as through from 'through2';
import * as vfs from 'vinyl-fs';
import * as yargs from 'yargs';
import * as eclint from './eclint';
import i18n = require('./i18n');

/* tslint:disable:no-var-requires */
const pkg = require('../package.json');
/* tslint:enable:no-var-requires */

function gitignore(): Stream {
	try {
		return excludeGitignore();
	} catch (ex) {
		if (ex.code === 'ENOENT') {
			return through.obj();
		} else {
			throw ex;
		}
	}
}

interface IArgv extends yargs.Argv {
	globs: string[];
	dest?: string;
	stream?: Stream;
}

function excludeBinaryFile(file: eclint.IEditorConfigLintFile) {
	return !(file && file.isBuffer() && fileType(file.contents));
}

function builder(argv: yargs.Argv): yargs.Argv {
	return argv.option('indent_style', {
		alias: 'i',
		choices: [
			'tab',
			'space',
			undefined,
		],
		describe: i18n('Indentation Style'),
		requiresArg: false,
	})
		.option('indent_size', {
			alias: 's',
			describe: i18n('Indentation Size (in single-spaced characters)'),
			type: 'number',
		})
		.option('tab_width', {
			alias: 't',
			describe: i18n('Width of a single tabstop character'),
			type: 'number',
		})
		.option('end_of_line', {
			alias: 'e',
			choices: [
				'lf',
				'crlf',
				'cr',
				undefined,
			],
			describe: i18n('Line ending file format (Unix, DOS, Mac)'),
		})
		.option('charset', {
			alias: 'c',
			choices: [
				'latin1',
				'utf-8',
				'utf-8-bom',
				'utf-16le',
				'utf-16be',
				undefined,
			],
			describe: i18n('File character encoding'),
		})
		.option('trim_trailing_whitespace', {
			alias: 'w',
			default: undefined,
			describe: i18n('Denotes whether whitespace is allowed at the end of lines'),
			type: 'boolean',
		})
		.option('insert_final_newline', {
			alias: 'n',
			default: undefined,
			describe: i18n('Denotes whether file should end with a newline'),
			type: 'boolean',
		})
		.option('max_line_length', {
			alias: 'm',
			default: undefined,
			describe: i18n('Forces hard line wrapping after the amount of characters specified'),
			type: 'number',
		})
		.option('block_comment_start', {
			default: undefined,
			describe: i18n('Block comments start with'),
			type: 'string',
		})
		.option('block_comment', {
			default: undefined,
			describe: i18n('Lines in block comment start with'),
			type: 'string',
		})
		.option('block_comment_end', {
			default: undefined,
			describe: i18n('Block comments end with'),
			type: 'string',
		});
}

function inferBuilder(argv: yargs.Argv): yargs.Argv {
	return argv
		.option('score', {
			alias: 's',
			describe: i18n('Shows the tallied score for each setting'),
			type: 'boolean',
		})
		.option('ini', {
			alias: 'i',
			describe: i18n('Exports file as ini file type'),
			type: 'boolean',
		})
		.option('root', {
			alias: 'r',
			describe: i18n('Adds root = true to your ini file, if any'),
			type: 'boolean',
		});
}

function handler(argv: IArgv): Stream.Transform {
	let ignore = [
		// # Repository
		// Git
		'!.git/**/*',
		// Subversion
		'!.svn/**/*',
		// Mercurial
		'!.hg/**/*',
		// # Dependency directories
		'!node_modules/**/*',
		'!bower_components/**/*',
		// # macOS
		// Stores custom folder attributes
		'!**/.DS_Store',
		// Stores additional file resources
		'!**/.AppleDouble',
		// Contains the absolute path to the app to be used
		'!**/.LSOverride',
		// Resource fork
		'!**/__MACOSX/**/*',
		// # Windows
		// Image file cache
		'!**/Thumbs.db',
		// Folder config file
		'!**/ehthumbs.db',
	];
	let globs = argv.globs;
	if (globs && globs.length) {
		globs = globs.map((file) => {
			let stat;
			try {
				stat = fs.statSync(file);
			} catch (e) {
				//
			}

			if (stat) {
				if (stat.isDirectory()) {
					return path.join(file, '**/*');
				} else {
					ignore = ignore.filter((glob) => (
						!minimatch(file, glob.slice(1), {
							dot: true,
						})
					));
				}
			}
			return file;
		});
	} else {
		globs = ['**/*'];
	}

	globs = globs.concat(ignore);
	argv.globs = globs;
	return vfs.src(globs, {
		dot: true,
		// stripBOM: false,
		removeBOM: false,
	})
		.pipe(filter(excludeBinaryFile))
		.pipe(gitignore());
}

function pickSettings(argv: yargs.Argv): eclint.ICommandOptions {
	const settings = _.pickBy(_.pick(argv, eclint.ruleNames));
	return {
		settings: settings as eclint.ISettings,
	};
}

function check(argv: IArgv): Stream.Transform {
	return argv.stream = handler(argv)
		.pipe(eclint.check(pickSettings(argv)))
		.pipe(reporter({
			blame: false,
			output: console.error,
		}))
		.on('error', (error) => {
			if (error.plugin !== 'gulp-reporter') {
				console.error(error);
			}
			process.exitCode = -1;
		}).resume();
}

function fix(argv: IArgv): Stream {
	return argv.stream = handler(argv)
		.pipe(eclint.fix(pickSettings(argv)))
		.pipe(argv.dest ? vfs.dest(argv.dest) : vfs.dest((file) => file.base));
}

function infer(argv: IArgv): Stream {
	return argv.stream = handler(argv)
		.pipe(eclint.infer(_.pickBy(argv) as eclint.InferOptions))
		.pipe(tap((file) => {
			console.log(file.contents + '');
		}));
}

export = (argv) => yargs(argv)
	.usage(i18n('Usage: $0 <command> [globs...] [<options>]'))
	.command({
		builder,
		command: 'check [globs...]',
		describe: i18n('Validate that file(s) adhere to .editorconfig settings'),
		handler: check,
	})
	.command({
		builder: (fixArgv) => (
			builder(fixArgv).option('dest', {
				alias: 'd',
				describe: i18n('Destination folder to pipe source files'),
				type: 'string',
			})
		),
		command: 'fix   [globs...]',
		describe: i18n('Fix formatting errors that disobey .editorconfig settings'),
		handler: fix,
	})
	.command({
		builder: inferBuilder,
		command: 'infer [globs...]',
		describe: i18n('Infer .editorconfig settings from one or more files'),
		handler: infer,
	})
	.demandCommand(1, 1, i18n('CommandError: Missing required sub-command.'))
	.help()
	.version(pkg.version)
	.argv;
