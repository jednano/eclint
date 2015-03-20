# ECLint

[![Build Status](https://travis-ci.org/jedmao/eclint.svg?branch=master)](https://travis-ci.org/jedmao/eclint)
[![npm version](https://badge.fury.io/js/eclint.svg)](http://badge.fury.io/js/eclint)
[![Code Climate](https://codeclimate.com/github/jedmao/eclint/badges/gpa.svg)](https://codeclimate.com/github/jedmao/eclint)
[![Test Coverage](https://codeclimate.com/github/jedmao/eclint/badges/coverage.svg)](https://codeclimate.com/github/jedmao/eclint)
[![NPM license](http://img.shields.io/npm/l/editorconfig-tools.svg?style=flat-square)](https://www.npmjs.org/package/editorconfig-tools)


## Introduction

ECLint is a tool for validating or fixing code that doesn't adhere to settings defined in `.editorconfig`. It also infers settings from existing code. See the [EditorConfig Project](http://editorconfig.org/) for details about the `.editorconfig` file.

This version of ECLint runs on [EditorConfig Core](https://www.npmjs.com/package/editorconfig) 0.12.x.


## Installation

```
$ npm install [-g] eclint
```


## Features

- [Command-Line Interface (CLI)](#cli)
- [Check](#check), [fix](#fix) or [infer](#infer) the following EditorConfig rules across one or more files:
	- [charset](#charset)
	- [indent_style](#indent_style)
	- [indent_size](#indent_size)
	- [tab_width](#tab_width)
	- [trim_trailing_whitespace](#trim_trailing_whitespace)
	- [end_of_line](#end_of_line)
	- [insert_final_newline](#insert_final_newline)
	- [max_line_length (unofficial)](#max_line_length-unofficial)
- [TypeScript/JavaScript API](#api)
- [Gulp plugin](#gulp-plugin)


## CLI

The command-line interface (CLI) for this project uses [gitlike-cli](https://www.npmjs.com/package/gitlike-cli) to parse the `eclint` command, along with its [check](#check), [fix](#fix) and [infer](#infer) sub-commands. Internally, the command is sent to the [API](#api) to do its magic.

Running just `eclint` will provide the following help information:

```
$ eclint

  CommandError: Missing required sub-command.

  Usage: eclint.js [options] <command> [null]

  Commands:

    check  Validate that file(s) adhere to .editorconfig settings
    fix    Fix formatting errors that disobey .editorconfig settings
    infer  Infer .editorconfig settings from one or more files

  Options:

    -h, --help     output help information
    -v, --version  output version information
```


## Check

The `eclint check` sub-command allows you to validate that files adhere to their respective EditorConfig settings. Running just `eclint check` will provide you the following help information:

```
$ eclint check

  CommandError: Missing required arguments.

  Usage: check [options] <files>...

  Options:

    -h, --help                      output help information
    -c, --charset <charset>         Set to latin1, utf-8, utf-8-bom (see docs)
    -i, --indent_style <style>      Set to tab or space
    -s, --indent_size <n>           Set to a whole number or tab
    -t, --tab_width <n>             Columns used to represent a tab character
    -w, --trim_trailing_whitespace  Trims any trailing whitespace
    -e, --end_of_line <newline>     Set to lf, cr, crlf
    -n, --insert_final_newline      Ensures files ends with a newline
    -m, --max_line_length <n>       Set to a whole number
```

Running this sub-command without any `[options]` will use each file's EditorConfig settings as the validation settings. In fact, you don't even need to pass-in any CLI `[options]` for this sub-command to work, but doing so will allow you to override the `.editorconfig` file settings in cases where you want more fine-grain control over the outcome.

Each CLI option has both short and long flag variations. As such, you can use `--indent_size 2` or `-i 2`, whichever you prefer. Short flags may be combined into a single argument. For example, `-swe 2 lf` is the same as `-s 2 -w -e lf`.

The `<files>...` args allows you to pass-in one or more file paths or [globs](https://github.com/isaacs/node-glob). You may, however, need to surround your glob expressions in quotes for it to work properly. Unfortunately, in bash, you can't add a negative glob with "!foo.js". Instead, you can put square brackets around the `!` and eclint will take care of it. For example, "[!]foo.js".

The result of running `eclint check *` in this project's root, if there were issues, would look something like the following:

```
Z:\Documents\GitHub\eclint\README.md: Invalid indent style: space
```

If any errors are reported, the Node process will exit with a status code of `1`, failing any builds or continuous integrations you may have setup. This is to help you enforce EditorConfig settings on your project or team. For Travis-CI, you can do this by adding the following `before_script` block to your .travis.yml file:

```yml
before_script:
  - npm install -g eclint
  - eclint check * "lib/**/*.js"
```

This is the same method this project is doing in its own [.travis.yml file](https://github.com/jedmao/eclint/blob/master/.travis.yml#L14-L16) for reference.

Now should be a great time to segue into the [fix sub-command](#fix).


## Fix

<img src="data:image/png;base64,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" alt="Warning, Stop!" width="72" height="65" style="float:left">

**Warning! Fixing your files will change their contents. Ensure that your files are under version control and that you have committed your changes before attempting to fix any issues with them.**

The `eclint fix` sub-command allows you to fix files that don't adhere to their respective EditorConfig settings. Running just `eclint fix` will provide you the following help information:

```
$ eclint fix

  CommandError: Missing required arguments.

  Usage: fix [options] <files>...

  Options:

    -h, --help                      output help information
    -c, --charset <charset>         Set to latin1, utf-8, utf-8-bom (see docs)
    -i, --indent_style <style>      Set to tab or space
    -s, --indent_size <n>           Set to a whole number or tab
    -t, --tab_width <n>             Columns used to represent a tab character
    -w, --trim_trailing_whitespace  Trims any trailing whitespace
    -e, --end_of_line <newline>     Set to lf, cr, crlf
    -n, --insert_final_newline      Ensures files ends with a newline
    -m, --max_line_length <n>       Set to a whole number
    -d, --dest <folder>             Destination folder to pipe source files
```

You might notice this sub-command looks very similar to the [check sub-command](#check). It works essentially the same way; except, instead of validating files, it enforces the settings on each file by altering their contents. I'll let you read the [check sub-command](#check) so I don't have to repeat myself.

One difference you'll notice is an additional `-d, --dest <folder>` option. This option gives you control over where the result file tree will be written. It's not technically required, but if you don't specify this option then the files won't be written anywhere, which would be pointless. I'm still looking for a way to automatically overwrite the files provided in the `<files>...` args, which, when I do, this `dest` option will only be needed if you want to write the files elsewhere.


## Infer

The `eclint infer` sub-command allows you to infer what the EditorConfig settings **_should_** be for all files you specify. Running just `eclint infer` will provide you the following help information:

```
$ eclint infer

  CommandError: Missing required arguments.

  Usage: infer [options] <files>...

  Options:

    -h, --help   output help information
    -s, --score  Shows the tallied score for each setting
    -i, --ini    Exports file as ini file type
    -r, --root   Adds root = true to your ini file, if any
```

This sub-command generates a report that reveals whatever trends you have growing in your project. That is, if it's more common to see 2-space indentation, the inferred setting would be `indent_size = 2`.

By default, the CLI will print out the report in JSON format.

```
$ eclint infer * "lib/**/*.js"
```

Outputs:

```json
{
	"indent_style": "tab",
	"trim_trailing_whitespace": true,
	"end_of_line": "lf",
	"insert_final_newline": true,
	"max_line_length": 90
}
```

If this isn't enough information for you and you want the full report, complete with scores, you can add the `-s, --score` flag. Each setting will have a numeric value assigned to it that indicates the number of times that setting was inferred across the files:

```
$ eclint infer --score * "lib/**/*.js"
```

Outputs:

```json
{
	"charset": {
		"": 1
	},
	"indent_style": {
		"undefined": 21,
		"tab": 13
	},
	"indent_size": {
		"0": 21,
		"tab":13
	},
	"trim_trailing_whitespace": {
		"true": 34
	},
	"end_of_line": {
		"lf": 34
	},
	"insert_final_newline": {
		"true": 1
	},
	"max_line_length": 86
}
```

You can pipe these files to any destination file you wish, like so:

```
$ eclint infer * "lib/**/*.js" > editorconfig.json
```

You can also use the `-i, --ini` flag to generate the report as an INI file format, which is exactly the format in which the `.editorconfig` file should be written. This means you can create your `.editorconfig` file automatically! Here's how you might do it:

```
$ eclint infer --ini * "lib/**/*.js" > .editorconfig
```

If this is your root `.editorconfig` file, you'll definitely want to pair the `-i, --ini` flag with the `-r, --root` flag to add `root = true` to your `.editorconfig` file. We'll combine the 2 short flags into one:

```
$ eclint infer -ir * "lib/**/*.js" > .editorconfig
```

Your root `.editorconfig` file should now read thus:

```ini
# EditorConfig is awesome: http://EditorConfig.org

# top-most EditorConfig file
root = true

[*]
indent_style = tab
trim_trailing_whitespace = true
end_of_line = lf
insert_final_newline = true
max_line_length = 90
```


## Rules

All EditorConfig rules are supported. Additionally, the [max_line_length](#max-line-length) has been added to the set. This is not an official EditorConfig setting, so it's possible it may be removed in the future. For now, it's has a basic use in this tool.


### charset

At this time, only the following encodings are supported:
- `latin1` (partial support)
- `utf-8`
- `utf-8-bom` (not actually an encoding, but it does have a BOM signature)
- `utf-16le`
- `utf-16be`

Unsupported encodings:
- `utf-32le`
- `utf-32be`
- everything else

I'm working on getting a much broader set of supported encodings, but it's rather difficult to support, so it may take a while.

_Note: Since this tool is itself a [Gulp plugin](#gulp-plugin), all BOM signatures will be stripped off internally by means of [strip-bom](https://www.npmjs.com/package/strip-bom). There's not much that can be done about this, but if you specify a supported charset in your `.editorconfig` file the BOMs will be inserted or re-inserted before they are written._


### indent_style

Supported settings:
- `space`
- `tab`


### indent_size

Supported settings:
- An integer
- `tab` (uses value from [tab_width](#tab_width))


### tab_width

Supported settings:
- An integer


### trim_trailing_whitespace

Supported settings:
- `true`
- `false`


### end_of_line

Supported settings:
- `lf`
- `cr`
- `crlf`


### insert_final_newline

Supported settings:
- `true`
- `false` (removes any and all final newlines)


### max_line_length (unofficial)

Supported settings:
- An integer

_Note: Unsupported for the fix command._


## API

This project's API is written in [TypeScript](http://www.typescriptlang.org/), a typed superset of JavaScript that compiles to plain JavaScript. Because it's written in TypeScript, the [definition files](https://github.com/jedmao/eclint/tree/master/d.ts) come for free and are always in sync with the generated JavaScript.

If you have an IDE that supports TypeScript, this saves you time by letting you stay in your editor instead of constantly looking up documentation online to figure out the arguments, types and interfaces you can pass-in to API functions.

To use the definition files for this project, include a reference to [eclint.d.ts](https://github.com/jedmao/eclint/blob/master/eclint.d.ts) and then require eclint as you would in a Node project:

```ts
///<reference path="node_modules/eclint/eclint.d.ts" />
import eclint = require('eclint');
```

In JavaScript, you just need to require the package:

```js
var eclint = require('eclint');
```

Now, you can pipe streams to the respective [check](#check), [fix](#fix) and [infer](#infer) sub-commands. Refer to [cli.ts](https://github.com/jedmao/eclint/blob/master/lib/cli.ts) for a working example of doing just that.


## Gulp Plugin

The [check](#check), [fix](#fix) and [infer](#infer) API commands are all [Gulp](http://gulpjs.com/) [plugins](http://gulpjs.com/plugins/). Here's an example of how you might use them:

```js
var gulp = require('gulp');
var eclint = require('eclint');

gulp.task('check', function() {
	return gulp.src([
			'*',
			'lib/**/*.js'
		])
		.pipe(eclint.check({
			reporter: function(file, message) {
				console.error(file.path + ':', message);
			}
		}));
});

gulp.task('fix', function() {
	return gulp.src([
			'*',
			'lib/**/*.js'
		])
		.pipe(eclint.fix())
		.pipe(gulp.dest('.'));
});

gulp.task('infer', function() {
	return gulp.src([
			'*',
			'lib/**/*.js'
		])
		.pipe(eclint.infer({
			ini: true,
			root: true
		}))
		.pipe(gulp.dest('.editorconfig'));
});
```


## Related Projects

* [editorconfig-tools](https://github.com/treyhunner/editorconfig-tools)
