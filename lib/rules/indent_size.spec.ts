import _ = require('lodash');
import common = require('../test-common');
import linez from 'linez';
import rule = require('./indent_size');

var expect = common.expect;
var createLine = common.createLine;
var Doc = linez.Document;

// ReSharper disable WrongExpressionStatement
describe('indent_size rule', () => {

	describe('check command', () => {

		it('reports invalid indent size: 2, expected: 4', () => {
			var errors = rule.check({ indent_size: 4 }, new Doc([
				createLine('  foo')
			]));
			expect(errors).to.have.lengthOf(1);
			expect(errors[0].rule).to.equal('indent_size');
			expect(errors[0].message).to.equal('invalid indent size: 2, expected: 4');
			expect(errors[0].lineNumber).to.equal(1);
			expect(errors[0].columnNumber).to.equal(1);
		});

		it('reports invalid indent size: 3, expected: 2', () => {
			var errors = rule.check({ indent_size: 2 }, new Doc([
				createLine('   foo')
			]));
			expect(errors).to.have.lengthOf(1);
			expect(errors[0].rule).to.equal('indent_size');
			expect(errors[0].message).to.equal('invalid indent size: 3, expected: 2');
			expect(errors[0].lineNumber).to.equal(1);
			expect(errors[0].columnNumber).to.equal(1);
		});

		it('remains silent when indent size is an unsupported string', () => {
			var errors = rule.check({ indent_size: 'foo' }, new Doc([
				createLine('')
			]));
			expect(errors).to.have.lengthOf(0);
		});

		it('remains silent when inferred indent size is tab', () => {
			var errors = rule.check({ indent_size: 4 }, new Doc([
				createLine('\tfoo')
			]));
			expect(errors).to.have.lengthOf(0);
		});

		it('remains silent when the indent style setting is tab', () => {
			var errors = rule.check({ indent_size: 4, indent_style: 'tab' }, new Doc([
				createLine('  foo')
			]));
			expect(errors).to.have.lengthOf(0);
		});

		it('remains silent when indent size is indeterminate', () => {
			var errors = rule.check({ indent_size: 4 }, new Doc([
				createLine('foo')
			]));
			expect(errors).to.have.lengthOf(0);
		});

		it('remains silent when indent size is valid', () => {
			var errors;
			errors = rule.check({ indent_size: 0 }, new Doc([
				createLine('foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, new Doc([
				createLine(' foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, new Doc([
				createLine('  foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, new Doc([
				createLine('   foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, new Doc([
				createLine('    foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, new Doc([
				createLine('     foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, new Doc([
				createLine('      foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, new Doc([
				createLine('       foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 1 }, new Doc([
				createLine('        foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 2 }, new Doc([
				createLine('  foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 2 }, new Doc([
				createLine('    foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 2 }, new Doc([
				createLine('      foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 2 }, new Doc([
				createLine('        foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 2 }, new Doc([
				createLine('          foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 3 }, new Doc([
				createLine('   foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 3 }, new Doc([
				createLine('      foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 4 }, new Doc([
				createLine('    foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 4 }, new Doc([
				createLine('        foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 5 }, new Doc([
				createLine('     foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 6 }, new Doc([
				createLine('      foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 7 }, new Doc([
				createLine('       foo')
			]));
			expect(errors).to.have.lengthOf(0);
			errors = rule.check({ indent_size: 8 }, new Doc([
				createLine('        foo')
			]));
			expect(errors).to.have.lengthOf(0);
		});

	});

	describe('fix command', () => {

		it('returns the line as-is', () => {
			var doc = new Doc([
				createLine('  \t foo')
			]);
			var fixedLine = rule.fix({
				indent_style: 'space',
				indent_size: 4
			}, doc);
			expect(fixedLine).to.deep.equal(doc);
		});

	});

	describe('infer command', () => {

		_.range(0, 9).forEach(n => {
			it('infers ' + n + '-space setting', () => {
				expect(rule.infer(new Doc([
					createLine(_.repeat(' ', n) + 'foo')
				]))).to.eq(n);
			});
		});

		it('infers leading spaces w/o any tabs that follow', () => {
			expect(rule.infer(new Doc([
				createLine('  \t\tfoo')
			]))).to.eq(2);
		});

	});

});
