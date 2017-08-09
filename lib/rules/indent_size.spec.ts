import _ = require('lodash');
import common = require('../test-common');
import * as doc from '../doc';
import rule = require('./indent_size');

var expect = common.expect;

describe('indent_size rule', () => {

	describe('check command', () => {

		it('reports invalid indent size: 2, expected: 4', () => {
			var errors = rule.check({ indent_size: 4 }, doc.create('  foo'));
			expect(errors).to.have.lengthOf(1);
			expect(errors[0].rule).to.equal('indent_size');
			expect(errors[0].message).to.equal('invalid indent size: 2, expected: 4');
			expect(errors[0].lineNumber).to.equal(1);
			expect(errors[0].columnNumber).to.equal(1);
		});

		it('reports invalid indent size: 3, expected: 4', () => {
			var errors = rule.check({ indent_size: 2 }, doc.create('   foo'));
			expect(errors).to.have.lengthOf(1);
			expect(errors[0].rule).to.equal('indent_size');
			expect(errors[0].message).to.equal('invalid indent size: 3, expected: 4');
			expect(errors[0].lineNumber).to.equal(1);
			expect(errors[0].columnNumber).to.equal(1);
		});

		it('remains silent when indent size is an unsupported string', () => {
			var errors = rule.check({ indent_size: 'foo' }, doc.create(''));
			expect(errors).to.have.lengthOf(0);
		});

		it('remains silent when inferred indent size is tab', () => {
			var errors = rule.check({ indent_size: 4 }, doc.create('\tfoo'));
			expect(errors).to.have.lengthOf(0);
		});

		it('remains silent when the indent style setting is tab', () => {
			var errors = rule.check({ indent_size: 4, indent_style: 'tab' }, doc.create('  foo'));
			expect(errors).to.have.lengthOf(0);
		});

		it('remains silent when indent size is indeterminate', () => {
			var errors = rule.check({ indent_size: 4 }, doc.create('foo'));
			expect(errors).to.have.lengthOf(0);
		});

		it('remains silent when indent size is valid', () => {
			var errors;
			errors = rule.check({ indent_size: 0 }, doc.create('foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, doc.create(' foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, doc.create('  foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, doc.create('   foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, doc.create('    foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, doc.create('     foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, doc.create('      foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, doc.create('       foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, doc.create('        foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 2 }, doc.create('  foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 2 }, doc.create('    foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 2 }, doc.create('      foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 2 }, doc.create('        foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 2 }, doc.create('          foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 3 }, doc.create('   foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 3 }, doc.create('      foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 4 }, doc.create('    foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 4 }, doc.create('        foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 5 }, doc.create('     foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 6 }, doc.create('      foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 7 }, doc.create('       foo'));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 8 }, doc.create('        foo'));
			expect(errors).to.have.lengthOf(0);
		});

		it('document comment', () => {
			var errors = rule.check({
				indent_size: 2
			}, doc.create([
				'/*',
				' * test',
				' */',
			].join('\n'), {
				block_comment_start: '/*',
				block_comment_end: '*/',
			}));
			expect(errors).to.have.lengthOf(0);
		});

		it('conditional comment', () => {
			var errors = rule.check({
				indent_size: 2
			}, doc.create([
				'// #if _DEBUG',
				'const data = {',
				"  key: 'value',",
				'};',
				'/* #else',
				'const data = {',
				"  key: 'value',",
				'};',
				'// #endif */'
			].join('\n'), {
				block_comment_start: '/*',
				block_comment_end: '*/',
			}));
			expect(errors).to.have.lengthOf(0);
		});

		it('normal block comment', () => {
			var errors = rule.check({
				indent_size: 2
			}, doc.create([
				'/* foo',
				'   bar */',
			].join('\n'), {
				block_comment_start: '/*',
				block_comment_end: '*/',
			}));
			expect(errors).to.have.lengthOf(0);
		});
	});

	describe('fix command', () => {

		it('returns the line as-is', () => {
			var document = doc.create('  \t foo');
			var fixedLine = rule.fix({
				indent_style: 'space',
				indent_size: 4
			}, document);
			expect(fixedLine).to.deep.equal(document);
		});

	});

	describe('infer command', () => {

		_.range(2, 9).forEach(n => {
			it('infers ' + n + '-space setting', () => {
				expect(rule.infer(doc.create(_.repeat(' ', n) + 'foo'))).to.eq(n);
			});
		});

		it('infers leading spaces w/o any tabs that follow', () => {
			expect(rule.infer(doc.create([
				'foo',
				'bar',
				'    /**',
				'     * bar',
				'     */',
				'  bar',
				'    bar',
				'  foo',
				' foo',
				'    foo',
				'bar',
				'bar',
				'bar',
			].join('\n'), {
				block_comment_start: '/**',
				block_comment: '*',
				block_comment_end: '*/',
			}))).to.eq(2);
		});

	});

});
