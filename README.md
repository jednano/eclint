# ECLint

[![Build Status](https://travis-ci.org/jedmao/eclint.svg?branch=master)](https://travis-ci.org/jedmao/eclint)
[![npm version](https://badge.fury.io/js/eclint.svg)](http://badge.fury.io/js/eclint)
[![codecov](https://codecov.io/gh/jedmao/eclint/branch/master/graph/badge.svg)](https://codecov.io/gh/jedmao/eclint)
[![npm license](http://img.shields.io/npm/l/eclint.svg?style=flat-square)](https://www.npmjs.org/package/eclint)
[![dependencies Status](https://david-dm.org/jedmao/eclint/status.svg)](https://david-dm.org/jedmao/eclint)

[![npm](https://nodei.co/npm/eclint.svg?downloads=true)](https://nodei.co/npm/eclint/)

## Introduction

ECLint is a tool for validating or fixing code that doesn't adhere to settings defined in `.editorconfig`. It also infers settings from existing code. See the [EditorConfig Project](http://editorconfig.org/) for details about the `.editorconfig` file.

This version of ECLint runs on [EditorConfig Core](https://www.npmjs.com/package/editorconfig) 0.15.x.


## Installation

```bash
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

Running `eclint --help` will provide the following help information:

```bash
$ eclint --help
Usage: eclint <command> [files...] [options]

Commands:
  check [files...]  Validate that file(s) adhere to .editorconfig settings
  fix   [files...]  Fix formatting errors that disobey .editorconfig settings
  infer [files...]  Infer .editorconfig settings from one or more files

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```


## Check

The `eclint check` sub-command allows you to validate that files adhere to their respective EditorConfig settings. Running `eclint check --help` will provide you the following help information:

```bash
$ eclint check --help
eclint check [files...]

Options:
  --help                          Show help                                                             [boolean]
  --version                       Show version number                                                   [boolean]
  --indent_style, -i              Indentation Style                                                     [choices: "tab", "space", undefined]
  --indent_size, -s               Indentation Size (in single-spaced characters)                        [number]
  --tab_width, -t                 Width of a single tabstop character                                   [number]
  --end_of_line, -e               Line ending file format (Unix, DOS, Mac)                              [choices: "lf", "crlf", "cr", undefined]
  --charset, -c                   File character encoding                                               [choices: "latin1", "utf-8", "utf-8-bom", "utf-16le", "utf-16be", undefined]
  --trim_trailing_whitespace, -w  Denotes whether whitespace is allowed at the end of lines             [boolean]
  --insert_final_newline, -n      Denotes whether file should end with a newline                        [boolean]
  --max_line_length, -m           Forces hard line wrapping after the amount of characters specified    [number]
  --block_comment_start           Block comments start with                                             [string]
  --block_comment                 Lines in block comment start with                                     [string]
  --block_comment_end             Block comments end with                                               [string]
```

Running this sub-command without any `[options]` will use each file's EditorConfig settings as the validation settings. In fact, you don't even need to pass-in any CLI `[options]` for this sub-command to work, but doing so will allow you to override the `.editorconfig` file settings in cases where you want more fine-grain control over the outcome.

Each CLI option has both short and long flag variations. As such, you can use `--indent_size 2` or `-i 2`, whichever you prefer. Short flags may be combined into a single argument. For example, `-swe 2 lf` is the same as `-s 2 -w -e lf`.

The `[<files>...]` args allows you to pass-in one or more file paths or [globs](https://github.com/isaacs/node-glob). You may, however, need to surround your glob expressions in quotes for it to work properly. Unfortunately, in bash, you can't add a negative glob with "!foo.js". Instead, you can put square brackets around the `!` and eclint will take care of it. For example, "[!]foo.js".

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

<table>
  <tr>
    <td width="99">
      <img src="https://github.com/jedmao/eclint/blob/master/images/warning.png?raw=true" alt="Warning, Stop!" width="72" height="65">
    </td>
    <td>
      <strong style="display:table-cell">Warning! Fixing your files will change their contents. Ensure that your files are under version control and that you have committed your changes before attempting to fix any issues with them. You can also run the check command to know which files will change before you fix them.</strong>
    </td>
  </tr>
</table>

The `eclint fix` sub-command allows you to fix files that don't adhere to their respective EditorConfig settings. Running `eclint fix --help` will provide you the following help information:

```bash
$ eclint fix --help
eclint fix   [files...]

Options:
  --help                          Show help                                                             [boolean]
  --version                       Show version number                                                   [boolean]
  --indent_style, -i              Indentation Style                                                     [choices: "tab", "space", undefined]
  --indent_size, -s               Indentation Size (in single-spaced characters)                        [number]
  --tab_width, -t                 Width of a single tabstop character                                   [number]
  --end_of_line, -e               Line ending file format (Unix, DOS, Mac)                              [choices: "lf", "crlf", "cr", undefined]
  --charset, -c                   File character encoding                                               [choices: "latin1", "utf-8", "utf-8-bom", "utf-16le", "utf-16be", undefined]
  --trim_trailing_whitespace, -w  Denotes whether whitespace is allowed at the end of lines             [boolean]
  --insert_final_newline, -n      Denotes whether file should end with a newline                        [boolean]
  --max_line_length, -m           Forces hard line wrapping after the amount of characters specified    [number]
  --block_comment_start           Block comments start with                                             [string]
  --block_comment                 Lines in block comment start with                                     [string]
  --block_comment_end             Block comments end with                                               [string]
  --dest, -d                      Destination folder to pipe source files                               [string]
```

You might notice this sub-command looks very similar to the [check sub-command](#check). It works essentially the same way; except, instead of validating files, it enforces the settings on each file by altering their contents. I'll let you read the [check sub-command](#check) so I don't have to repeat myself.

One key difference you'll notice is an additional `-d, --dest <folder>` option. This option gives you control over where the result file tree will be written. Without this specified, the files will be overwritten in the source location by default.


## Infer

The `eclint infer` sub-command allows you to infer what the EditorConfig settings **_should_** be for all files you specify. Running `eclint infer --help` will provide you the following help information:

```bash
$ eclint infer --help
eclint infer [files...]

Options:
  --help       Show help                                               [boolean]
  --version    Show version number                                     [boolean]
  --score, -s  Shows the tallied score for each setting                [boolean]
  --ini, -i    Exports file as ini file type                           [boolean]
  --root, -r   Adds root = true to your ini file, if any               [boolean]
```

This sub-command generates a report that reveals whatever trends you have growing in your project. That is, if it's more common to see 2-space indentation, the inferred setting would be `indent_size = 2`.

By default, the CLI will print out the report in JSON format.

```bash
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

```bash
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

```bash
$ eclint infer * "lib/**/*.js" > editorconfig.json
```

You can also use the `-i, --ini` flag to generate the report as an INI file format, which is exactly the format in which the `.editorconfig` file should be written. This means you can create your `.editorconfig` file automatically! Here's how you might do it:

```bash
$ eclint infer --ini * "lib/**/*.js" > .editorconfig
```

If this is your root `.editorconfig` file, you'll definitely want to pair the `-i, --ini` flag with the `-r, --root` flag to add `root = true` to your `.editorconfig` file. We'll combine the 2 short flags into one:

```bash
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

## Respect .gitignore

```bash
$ env eclint check $(git ls-files)
```
for compatible with Windows, you can install [exec-extra](https://github.com/gucong3000/exec-extra)

## Locales currently supported:

- en: English.
- zh_CN: Simplified Chinese.
- zh_TW: Traditional Chinese.

## Rules

All EditorConfig rules are supported. Additionally, the [max_line_length](#max-line-length) rule has been added to the set. This is not an official EditorConfig setting, so it's possible it may be removed in the future. For now, it's has a basic use in this tool.


### charset

At this time, only the following encodings are supported:
- latin1 (partial support)
- utf-8
- utf-8-bom (not actually an encoding, but it does have a BOM signature)
- utf-16le
- utf-16be

Unsupported encodings:
- utf-32le
- utf-32be
- everything else

I'm working on getting a much broader set of supported encodings, but it's rather difficult to support, so it may take a while.

##### check

Reports the following errors:

- `invalid charset: <detected>, expected: <charset>`
- `expected charset: <charset>`
- `line <n>, column: <n>: character out of latin1 range: <character>`

##### fix

Fixes supported charsets by adding or removing BOM signatures and encoding the text in the new charset.

##### infer

Only infers documents with BOM signatures. No other assumptions made at this time.


### indent_style

Supported settings:
- space
- tab

##### check

A maximum of one error will be reported per line. The following errors will be reported, listed in order of priority:

- `line <n>: invalid indentation: found a leading <space/tab>, expected: <indent_style>`
  - Reported when the very first character in the line is the opposing indent style.
- `line <n>: invalid indentation: found <n> <soft/hard> <tab/tabs>`
  - This happens when the first character in the line is correct, but the wrong indentation is found somewhere else in the leading indentation.
- `line <n>: invalid indentation: found mixed tabs with spaces`
  - Reported when a space is followed by a tab anywhere in the leading whitespace.

##### fix

The fix method can fix indentation in the following ways:

- Replaces hard tabs with soft tabs or vice versa.
  - Alignment is preserved.
  - Mixed hard/soft tabs are fixed only if soft tabs match the `indent_size` or `tab_width`.

##### infer

Looks at the first character of each line to determine the strongest trend in your file.


### indent_size

Supported settings:
- An integer
- tab (pulls value from [tab_width](#tab_width))

##### check

Reports the following errors:

- `line <n>: invalid indent size: <n>, expected: <indent_size>`
  - Reported when the inferred setting for the line is divided by the configuration setting with no remainder. See the infer method for more information.

##### fix

Fixing indent size issues without any knowledge of the written language or syntax tree is literally impossible. Any attempt would be completely unreliable. I welcome debate over this topic, but I've been over it again and again and it just can't be done. As such, each line is simply passed through without modification.

##### infer

If the first character in a line is a tab, the indent size will be undefined. If it's spaces, however, I count backwards from 8 to 1, dividing the number of leading spaces by this number. If there is no remainder, that number is inferred as the indent size. Every line is tallied up with a score for each possible indent size and the highest score wins for the document. I've found this method to be extremely reliable.


### tab_width

Supported settings:
- An integer

This tool only uses `tab_width` as a fallback for `indent_size`.


### trim_trailing_whitespace

Supported settings:
- true

##### check

Reports the following errors:

- `line <n>: unexpected trailing whitespace`

##### fix

When `true`, removes trailing whitespace. Anything other than `true` is ignored.

##### infer

Infers `true` if no trailing whitespace is found. Infers `undefined` otherwise. Does not infer `false` under any scenarios.


### end_of_line

Supported settings:
- lf
- cr
- crlf

##### check

Reports the following errors:

- `line <n>: invalid newline: <detected>, expected: <end_of_line>`

##### fix

Replaces all invalid newlines with the one defined in your configuration.

##### infer

Infers the most popular newline found in each document.


### insert_final_newline

Supported settings:
- true
- false

##### check

Reports the following errors:

- `<expected/unexpected> final newline character`

##### fix

- When `true`, inserts a single newline at the end of the file.
- When `false`, removes all newlines found at the end of the file.

##### infer

- Infers `true` when no newlines are found at the end of the file.
- Infers `false` when a newline is found at the end of the file.


### max_line_length (unofficial)

Supported settings:
- An integer

##### check

Reports the following errors:

- `line <n>: line length: <detected>, exceeds: <max_line_length>`

##### fix

Unsupported.

##### infer

Scans an entire document for line length and infers the greatest line length detected, rounded up to the nearest 10 (e.g., 72 becomes 80).

### block_comment_start

Defines the start of block comments

### block_comment

Defines the start of line in block comments

### block_comment_end

Defines the end of block comments

## Support for doc comments

When you use doc comments, eclint might report a error with your indentation style. At this case, you need to defines the style of the doc comments you are using in `.editorconfig`:
```
[*]
# C-style doc comments
block_comment_start = /*
block_comment = *
block_comment_end = */
```

## API

This project's API is written in [TypeScript](http://www.typescriptlang.org/), a typed superset of JavaScript that compiles to plain JavaScript. Because it's written in TypeScript, the [definition files](https://github.com/jedmao/eclint/tree/master/d.ts) come for free and are always in sync with the generated JavaScript.

If you have an IDE that supports TypeScript, this saves you time by letting you stay in your editor instead of constantly looking up documentation online to figure out the arguments, types and interfaces you can pass-in to API functions.

```ts
import * as eclint from 'eclint';
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
var reporter = require('gulp-reporter');
var path = require('path');

gulp.task('check', function() {
  return gulp.src([
      '*',
      'lib/**/*.js'
    ])
    .pipe(eclint.check())
    .pipe(reporter());
});

gulp.task('fix', function() {
  return gulp.src([
      '*',
      'lib/**/*.js'
    ],
    {
      base: './'
    })
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

Have a look at this project's [check](https://github.com/jedmao/eclint/blob/master/tasks/check.js) and [fix](https://github.com/jedmao/eclint/blob/master/tasks/fix.js) tasks for a working example. Notice that the check tasks exits with an exit code of `1`. This is to fail whatever continuous integration you may have in place.


## Related Projects

* [editorconfig-tools](https://github.com/treyhunner/editorconfig-tools)
