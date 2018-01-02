import * as common from '../test-common';
import rule = require('./max_line_length');
const createLine = common.createLine;
const expect = common.expect;
/* tslint:disable:no-unused-expression */

describe('max_line_length rule', () => {

	describe('check command', () => {

		it('validates max_line_length setting',() => {
			const fooLine = createLine('foo', { number: 1 });
			let error;
			error = rule.check({}, fooLine);
			expect(error).to.be.undefined;
			error = rule.check({ max_line_length: 3 }, fooLine);
			expect(error).to.be.undefined;
			error = rule.check({ max_line_length: 2 }, fooLine);
			expect(error).to.be.ok;
			expect(error.rule).to.equal('max_line_length');
			expect(error.message).to.be.equal('invalid line length: 3, exceeds: 2');
			expect(error.lineNumber).to.equal(1);
			expect(error.columnNumber).to.equal(2);
		});

	});

	describe('fix command', () => {

		it('returns the line as-is',() => {
			const line = createLine('foobar');
			const fixedLine = rule.fix({ max_line_length: 2 }, createLine('foobar'));
			expect(fixedLine).to.deep.equal(line);
		});

	});

	describe('infer command', () => {

		it('infers max line length', () => {
			const maxLineLength = rule.infer(createLine('foo'));
			expect(maxLineLength).to.eq(3);
		});

		it('ignores newline characters', () => {
			const maxLineLength = rule.infer(createLine('foo', { ending: '\n'}));
			expect(maxLineLength).to.eq(3);
		});

	});

});
