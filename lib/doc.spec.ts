import common = require('./test-common');
import doc = require('./doc');
var expect = common.expect;

describe('eclint doc', function() {
	it('block comment rule', () => {
		var lines = doc.create([
			'\tfoo',
			'/*',
			' *',
			' */',
			'bar',
		].join('\n'), {
			block_comment_start: '/*',
			block_comment: '*',
			block_comment_end: '*/',
		}).lines;

		expect(lines).to.have.length(5);
		expect(lines[0].isBlockCommentStart).to.be.not.ok;
		expect(lines[0].isBlockComment).to.be.not.ok;
		expect(lines[0].isBlockCommentEnd).to.be.not.ok;
		expect(lines[0].padSize).to.be.not.ok;

		expect(lines[1].isBlockCommentStart).to.be.ok;
		expect(lines[1].isBlockComment).to.be.not.ok;
		expect(lines[1].isBlockCommentEnd).to.be.not.ok;
		expect(lines[1].padSize).to.be.not.ok;

		expect(lines[2].isBlockCommentStart).to.be.not.ok;
		expect(lines[2].isBlockComment).to.be.ok;
		expect(lines[2].isBlockCommentEnd).to.be.not.ok;
		expect(lines[2].padSize).to.eq(1);

		expect(lines[3].isBlockCommentStart).to.be.not.ok;
		expect(lines[3].isBlockComment).to.be.ok;
		expect(lines[3].isBlockCommentEnd).to.be.ok;
		expect(lines[3].padSize).to.eq(1);

		expect(lines[4].isBlockCommentStart).to.be.not.ok;
		expect(lines[4].isBlockComment).to.be.not.ok;
		expect(lines[4].isBlockCommentEnd).to.be.not.ok;
		expect(lines[4].padSize).to.be.not.ok;
	});

	it('block comment start & end', () => {
		var lines = doc.create([
			'\tfoo',
			'/*',
			' *',
			' */',
			'bar',
		].join('\n'), {
			block_comment_start: '/*',
			block_comment_end: '*/',
		}).lines;

		expect(lines).to.have.length(5);
		expect(lines[0].isBlockCommentStart).to.be.not.ok;
		expect(lines[0].isBlockComment).to.be.not.ok;
		expect(lines[0].isBlockCommentEnd).to.be.not.ok;
		expect(lines[0].padSize).to.be.not.ok;

		expect(lines[1].isBlockCommentStart).to.be.ok;
		expect(lines[1].isBlockComment).to.be.ok;
		expect(lines[1].isBlockCommentEnd).to.be.not.ok;
		expect(lines[1].padSize).to.be.not.ok;

		expect(lines[2].isBlockCommentStart).to.be.not.ok;
		expect(lines[2].isBlockComment).to.be.ok;
		expect(lines[2].isBlockCommentEnd).to.be.not.ok;
		expect(lines[2].padSize).to.be.not.ok;

		expect(lines[3].isBlockCommentStart).to.be.not.ok;
		expect(lines[3].isBlockComment).to.be.ok;
		expect(lines[3].isBlockCommentEnd).to.be.ok;
		expect(lines[3].padSize).to.be.not.ok;

		expect(lines[4].isBlockCommentStart).to.be.not.ok;
		expect(lines[4].isBlockComment).to.be.not.ok;
		expect(lines[4].isBlockCommentEnd).to.be.not.ok;
		expect(lines[4].padSize).to.be.not.ok;
	});

	it('broken block comment', () => {
		var lines = doc.create([
			' */',
			' *',
			'/*',
		].join('\n'), {
			block_comment_start: '/*',
			block_comment_end: '*/',
		}).lines;

		expect(lines).to.have.length(3);
		expect(lines[0].isBlockComment).to.be.not.ok;
		expect(lines[0].isBlockCommentStart).to.be.not.ok;

		expect(lines[1].isBlockComment).to.be.not.ok;

		expect(lines[2].isBlockComment).to.be.not.ok;
		expect(lines[2].isBlockCommentEnd).to.be.not.ok;
	});
});
