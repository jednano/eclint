import common = require('../test-common');
import rule = require('./max_line_length');
var createLine = common.createLine;

var expect = common.expect;

describe('max_line_length rule', () => {

	describe('check command', () => {

		it('validates max_line_length setting',() => {
			var fooLine = createLine('foo', { number: 1 });
			var error;
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
			var line = createLine('foobar');
			var fixedLine = rule.fix({ max_line_length: 2 }, createLine('foobar'));
			expect(fixedLine).to.deep.equal(line);
		});

	});

	describe('infer command', () => {

		it('infers max line length', () => {
			var maxLineLength = rule.infer(createLine('foo'));
			expect(maxLineLength).to.eq(3);
		});

		it('ignores newline characters', () => {
			var maxLineLength = rule.infer(createLine('foo', { ending: '\n'}));
			expect(maxLineLength).to.eq(3);
		});

	});

});
