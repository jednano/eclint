# ECLint

[![Build Status][]](https://travis-ci.org/jedmao/eclint)
[![Dependency Status][]](https://gemnasium.com/jedmao/eclint)
[![NPM version][]](http://badge.fury.io/js/eclint)
[![Views][]](https://sourcegraph.com/github.com/jedmao/eclint)


ECLint is a tool for validating or fixing code that doesn't adhere to settings
defined in `.editorconfig`. It also infers settings from existing code. See the
[EditorConfig Project][] for details about the `.editorconfig` file.

This version of ECLint runs on EditorConfig Core 0.12.x.


## Related Projects

* [editorconfig-tools](https://github.com/treyhunner/editorconfig-tools)


# Features

* Infer `.editorconfig` settings from one or more files.
* Check (validate) that file(s) adhere to `.editorconfig` settings.
* Fix formatting errors that disobey `.editorconfig` settings.


# Examples

Here is an example of the command-line API we want to support::

    $ cat .editorconfig
    [*]
    indent_style = space
    indent_size = 4

    $ eclint check test/lf_*.txt
    tests/lf_invalid_crlf.txt: Incorrect line ending found: crlf
    tests/lf_invalid_crlf.txt: No final newline found
    tests/lf_invalid_cr.txt: Incorrect line ending found: cr

    $ eclint infer *
    [*]
    indent_style = space
    indent_size = 4
    end_of_line = lf
    charset = utf-8
    insert_final_newline = true
    trim_trailing_whitespace = true

    [Makefile]
    indent_style = tab
    indent_size = tab

    $ eclint fix *
    Makefile: Converted tabs to spaces

    $ eclint check *


# Project Status

This project is not yet completed.  Feel free to play with the existing code,
but don't expect it to work well (or at all) yet.


# Running Tests

    $ npm test


[Build Status]: https://travis-ci.org/jedmao/eclint.png?branch=master
[Dependency Status]: https://gemnasium.com/jedmao/eclint.png
[NPM Version]: https://badge.fury.io/js/eclint.png
[Views]: https://sourcegraph.com/api/repos/github.com/jedmao/eclint/counters/views-24h.png
[NPM]: (https://nodei.co/npm/codepainter.png?downloads=true)
[EditorConfig Project]: http://editorconfig.org/


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jedmao/eclint/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
