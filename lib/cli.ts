import _ = require('lodash');
import tap = require('gulp-tap');
import vfs = require('vinyl-fs');
import gitignore = require('gulp-gitignore');
import eclint = require('./eclint');
import yargs = require('yargs');
import reporter = require('gulp-reporter');
import filter = require('gulp-filter');
import fileType = require('file-type');
import Stream = require('stream');
import i18n = require('./i18n');

const pkg = require('../package.json');

interface Argv extends yargs.Argv {
	files: string[];
	dest?: string;
}

function excludeBinaryFile(file: eclint.EditorConfigLintFile) {
	return !(file && file.isBuffer() && fileType(file.contents));
}

function builder(yargs: yargs.Argv): yargs.Argv {
	return yargs.option('indent_style', {
		alias: 'i',
		describe: i18n('Indentation Style'),
		requiresArg: false,
		choices: [
			'tab',
			'space',
			undefined
		]
	})
		.option('indent_size', {
			alias: 's',
			describe: i18n('Indentation Size (in single-spaced characters)'),
			type: 'number'
		})
		.option('tab_width', {
			alias: 't',
			describe: i18n('Width of a single tabstop character'),
			type: 'number'
		})
		.option('end_of_line', {
			alias: 'e',
			describe: i18n('Line ending file format (Unix, DOS, Mac)'),
			choices: [
				'lf',
				'crlf',
				'cr',
				undefined
			]
		})
		.option('charset', {
			alias: 'c',
			describe: i18n('File character encoding'),
			choices: [
				'latin1',
				'utf-8',
				'utf-8-bom',
				'utf-16le',
				'utf-16be',
				undefined
			]
		})
		.option('trim_trailing_whitespace', {
			alias: 'w',
			describe: i18n('Denotes whether whitespace is allowed at the end of lines'),
			default: undefined,
			type: 'boolean'
		})
		.option('insert_final_newline', {
			alias: 'n',
			describe: i18n('Denotes whether file should end with a newline'),
			default: undefined,
			type: 'boolean'
		})
		.option('max_line_length', {
			alias: 'm',
			describe: i18n('Forces hard line wrapping after the amount of characters specified'),
			default: undefined,
			type: 'number'
		})
		.option('block_comment_start', {
			describe: i18n('Block comments start with'),
			default: undefined,
			type: 'string'
		})
		.option('block_comment', {
			describe: i18n('Lines in block comment start with'),
			default: undefined,
			type: 'string'
		})
		.option('block_comment_end', {
			describe: i18n('Block comments end with'),
			default: undefined,
			type: 'string'
		});
}

function inferBuilder(yargs: yargs.Argv): yargs.Argv {
	return yargs
		.option('score', {
			alias: 's',
			describe: i18n('Shows the tallied score for each setting'),
			type: 'boolean'
		})
		.option('ini', {
			alias: 'i',
			describe: i18n('Exports file as ini file type'),
			type: 'boolean'
		})
		.option('root', {
			alias: 'r',
			describe: i18n('Adds root = true to your ini file, if any'),
			type: 'boolean'
		});
}

function handler(yargs: Argv): Stream.Transform {
	const hasFile = yargs.files && yargs.files.length;
	const files = hasFile ? yargs.files : [
		'**/*',
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
	let stream = vfs.src(files)
		.pipe(filter(excludeBinaryFile));
	if (!hasFile) {
		stream = stream.pipe(gitignore());
	}
	return stream;
}

function pickSettings(yargs: yargs.Argv): eclint.CommandOptions {
	const settings = _.pickBy(_.pick(yargs, eclint.ruleNames));
	return {
		settings: <eclint.Settings>settings
	};
}

function check(yargs: Argv): Stream.Transform {
	return handler(yargs)
		.pipe(eclint.check(pickSettings(yargs)))
		.pipe(reporter({
			console: console.error,
			filter: null,
		}))
		.on('error', function (error) {
			/* istanbul ignore if */
			if (error.plugin !== 'gulp-reporter') {
				console.error(error);
			}
			process.exitCode = 1;
		}).resume();
}

function fix(yargs: Argv): Stream {
	let stream = handler(yargs)
		.pipe(eclint.fix(pickSettings(yargs)));

	if (yargs.dest) {
		return stream.pipe(vfs.dest(yargs.dest));
	}
	return stream.pipe(vfs.dest(function (file) {
		return file.base;
	}));
}

function infer(yargs: Argv): Stream {
	return handler(yargs)
		.pipe(eclint.infer(<eclint.InferOptions>_.pickBy(yargs)))
		.pipe(tap(file => {
			console.log(file.contents + '');
		}));
}

yargs
	.usage(i18n('Usage: $0 <command> [files...] [options]'))
	.command({
		command: 'check [files...]',
		describe: i18n('Validate that file(s) adhere to .editorconfig settings'),
		builder: builder,
		handler: check
	})
	.command({
		command: 'fix   [files...]',
		describe: i18n('Fix formatting errors that disobey .editorconfig settings'),
		builder: yargs => (
			builder(yargs).option('dest', {
				alias: 'd',
				describe: i18n('Destination folder to pipe source files'),
				type: 'string'
			})
		),
		handler: fix
	})
	.command({
		command: 'infer [files...]',
		describe: i18n('Infer .editorconfig settings from one or more files'),
		builder: inferBuilder,
		handler: infer
	})
	.demandCommand(1, 1, i18n('CommandError: Missing required sub-command.'))
	.help()
	.version(pkg.version)
	.argv;
