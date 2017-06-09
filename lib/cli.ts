import _ = require('lodash');
import tap = require('gulp-tap');
import vfs = require('vinyl-fs');
import gitignore = require('gulp-gitignore');
import eclint = require('./eclint');
import yargs = require('yargs');
import reporter = require('gulp-reporter');
import filter = require('gulp-filter');
import fileType = require('file-type');
import path = require('path');
import stream = require('stream');

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
		describe: 'Indentation Style',
		requiresArg: false,
		choices: [
			'tab',
			'space',
			undefined
		]
	})
		.option('indent_size', {
			alias: 's',
			describe: 'Indentation Size (in single-spaced characters)',
			type: 'number'
		})
		.option('tab_width', {
			alias: 't',
			describe: 'Width of a single tabstop character',
			type: 'number'
		})
		.option('end_of_line', {
			alias: 'e',
			describe: 'Line ending file format (Unix, DOS, Mac)',
			choices: [
				'lf',
				'crlf',
				'cr',
				undefined
			]
		})
		.option('charset', {
			alias: 'c',
			describe: 'File character encoding',
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
			describe: 'Denotes whether whitespace is allowed at the end of lines',
			default: undefined,
			type: 'boolean'
		})
		.option('insert_final_newline', {
			alias: 'n',
			describe: 'Denotes whether file should end with a newline',
			default: undefined,
			type: 'boolean'
		})
		.option('max_line_length', {
			alias: 'm',
			describe: 'Set to a whole number',
			default: undefined,
			type: 'number'
		})
		.option('block_comment_start', {
			describe: 'Block comments start with',
			default: undefined,
			type: 'string'
		})
		.option('block_comment', {
			describe: 'Lines in block comment start with',
			default: undefined,
			type: 'string'
		})
		.option('block_comment_end', {
			describe: 'Block comments end with',
			default: undefined,
			type: 'string'
		});
}

function inferBuilder(yargs: yargs.Argv): yargs.Argv {
	return yargs
		.option('score', {
			alias: 's',
			describe: 'Shows the tallied score for each setting',
			type: 'boolean'
		})
		.option('ini', {
			alias: 'i',
			describe: 'Exports file as ini file type',
			type: 'boolean'
		})
		.option('root', {
			alias: 'r',
			describe: 'Adds root = true to your ini file, if any',
			type: 'boolean'
		});
}

function handler(yargs: Argv): stream.Transform {
	var files = yargs.files.length ? yargs.files : [
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
	var stream = vfs.src(files)
		.pipe(filter(excludeBinaryFile));
	if (!yargs.files.length) {
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

function check(yargs: Argv) {
	return handler(yargs)
		.pipe(eclint.check(pickSettings(yargs)))
		.pipe(reporter({
			console: console.error,
			filter: null,
		}))
		.on('error', function (error) {
			if (error.plugin !== 'gulp-reporter') {
				console.error(error);
			}
			process.exitCode = 1;
		});
}

function fix(yargs: Argv) {
	var stream = handler(yargs)
		.pipe(eclint.fix(pickSettings(yargs)));

	if (yargs.dest) {
		return stream.pipe(vfs.dest(yargs.dest));
	}
	return stream.pipe(vfs.dest(function (file) {
		return file.base;
	}));
}

function infer(yargs: Argv) {
	return handler(yargs)
		.pipe(eclint.infer(<eclint.InferOptions>yargs))
		.pipe(tap(function (file) {
			console.log(file.contents + '');
		}));
}

yargs
	.usage('Usage: eclint.js [options] <command> [<files>...]')
	.command({
		command: 'check [<files>...]',
		describe: 'Validate that file(s) adhere to .editorconfig settings',
		builder: builder,
		handler: check
	})
	.command({
		command: 'fix   [<files>...]',
		describe: 'Fix formatting errors that disobey .editorconfig settings',
		builder: function (yargs) {
			return (builder(yargs).option('dest', {
				alias: 'd',
				describe: 'Destination folder to pipe source files',
				type: 'string'
			}));
		},
		handler: fix
	})
	.command({
		command: 'infer [<files>...]',
		describe: 'Infer .editorconfig settings from one or more files',
		builder: inferBuilder,
		handler: infer
	})
	.demandCommand(1, 1, 'CommandError: Missing required sub-command.')
	.help()
	.version(pkg.version)
	.locale(path.relative(__dirname, '../locales'))
	.argv;
