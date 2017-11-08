## 2.5.0
- remove: Dependence of [y18n](https://www.npmjs.com/package/y18n). [#109](https://github.com/jedmao/eclint/pull/109)
- bugfix: Support dot files. [#106](https://github.com/jedmao/eclint/pull/106)

## 2.4.3
- bugfix: Do not use index_size file config when converting indentation from space to tab. [#103](https://github.com/jedmao/eclint/pull/103)
- update: dependencies. [#102](https://github.com/jedmao/eclint/pull/102)

## 2.4.2
- bugfix: Break valid block comment. [#97](https://github.com/jedmao/eclint/pull/97)
- bugfix: Generated empty locales file after execute eclint command. [#99](https://github.com/jedmao/eclint/pull/99)
- bugfix: fail to recognize BOM [#98](https://github.com/jedmao/eclint/pull/98)
- update: coverage for `createPluginError` [#101](https://github.com/jedmao/eclint/pull/101)

## 2.4.1
bugfix: Break valid block comment. [#97](https://github.com/jedmao/eclint/pull/97)

## 2.4.0
- Fix: [yargs/y18n#48](https://github.com/yargs/y18n/issues/48) [#93](https://github.com/jedmao/eclint/pull/93)
- Fix: [thomas-lebeau/gulp-gitignore#2](https://github.com/thomas-lebeau/gulp-gitignore/issues/2) [#84](https://github.com/jedmao/eclint/pull/84)
- Update: CLI & testcase, use mock. [#88](https://github.com/jedmao/eclint/pull/88)
- Update: Output verbosity. [#92](https://github.com/jedmao/eclint/pull/92)
- Update: dependencies. [#82](https://github.com/jedmao/eclint/pull/82) [#89](https://github.com/jedmao/eclint/pull/89) [#94](https://github.com/jedmao/eclint/pull/94)
- Add: Support for non doc block comment. [#87](https://github.com/jedmao/eclint/pull/87)
- Add: Support directories on CLI. [#86](https://github.com/jedmao/eclint/pull/86)

## 2.3.0
- Added: Removes empty final new lines where there is more than one [#77](https://github.com/jedmao/eclint/pull/77)
- Upgraded: dependencies. [#78](https://github.com/jedmao/eclint/pull/78)

## 2.2.0
- Replace `gitlike-cli` with `yargs` for CLI [#73](https://github.com/jedmao/eclint/pull/73)
- Added: locales for CLI [#73](https://github.com/jedmao/eclint/pull/73)
- Fixed: i18n not work. [#73](https://github.com/jedmao/eclint/pull/73)
- Upgraded: gulp usecase. [#70](https://github.com/jedmao/eclint/pull/70)
- Upgraded: dependencies.

## 2.1.0
- Bug fix: not skip all kind of binary file. (e.g. "*.exe") [#65](https://github.com/jedmao/eclint/pull/65)
- Support locales in message of rule. [#60](https://github.com/jedmao/eclint/pull/60)
- Support for doc comments. [#62](https://github.com/jedmao/eclint/pull/62)
- Update algorithm for indentation. [#62](https://github.com/jedmao/eclint/pull/62)
- Update dependencies.

## 2.0.1
- Fix bin path [#58](https://github.com/jedmao/eclint/issues/58).

## 2.0.0
- **Breaking Change:** `console.error` instead of `console.log` to output error messages [#55](https://github.com/jedmao/eclint/pull/55).
- Added: Default value for options <files...> [#46](https://github.com/jedmao/eclint/issues/46).
- Added: Exclude binary files [#45](https://github.com/jedmao/eclint/issues/45).
- Added: Beautiful console report [#53](https://github.com/jedmao/eclint/pull/53).
- Added: Support for `.gitignore` when `[<files>...]` are not provided [#56](https://github.com/jedmao/eclint/pull/56).
- Added: Test cases for CLI [#55](https://github.com/jedmao/eclint/pull/55).
- Fixed: Stripping of BOMs [#50](https://github.com/jedmao/eclint/pull/50).
- Fixed: path import in README [#48](https://github.com/jedmao/eclint/pull/48).
- Upgraded dependencies.

## 1.1.5
- Fix npm publish.

## 1.1.4
- Fix `fix` and `infer` in non-interactive environments [#33](https://github.com/jedmao/eclint/pull/33).

## 1.1.3
- Fix behavior in non-interactive environments [#32](https://github.com/jedmao/eclint/pull/32).

## 1.1.2
- Pin iconv-lite version.

## 1.1.1
- Fix: exit with non-zero status code when errors are reported.

## 1.1.0
- Re-add support for Node 0.10.

## 1.0.0
- Dropped support for Node 0.10.
