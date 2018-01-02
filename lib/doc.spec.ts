import * as doc from './doc';
import * as common from './test-common';
const expect = common.expect;
/* tslint:disable:no-unused-expression */

describe('eclint doc', () => {
	it('block comment rule', () => {
		const lines = doc.create([
			'\tfoo',
			'/*',
			' *',
			' */',
			'bar',
		].join('\n'), {
			block_comment: '*',
			block_comment_end: '*/',
			block_comment_start: '/*',
		}).lines;

		expect(lines).to.have.length(5);
		expect(lines[0]).haveOwnProperty('isBlockCommentStart').and.to.be.not.ok;
		expect(lines[0]).haveOwnProperty('isBlockComment').and.to.be.not.ok;
		expect(lines[0]).haveOwnProperty('isBlockCommentEnd').and.to.be.not.ok;
		expect(lines[0]).haveOwnProperty('padSize').and.to.be.not.ok;

		expect(lines[1]).haveOwnProperty('isBlockCommentStart').and.to.be.ok;
		expect(lines[1]).haveOwnProperty('isBlockComment').and.to.be.not.ok;
		expect(lines[1]).haveOwnProperty('isBlockCommentEnd').and.to.be.not.ok;
		expect(lines[1]).haveOwnProperty('padSize').and.to.be.not.ok;

		expect(lines[2]).haveOwnProperty('isBlockCommentStart').and.to.be.not.ok;
		expect(lines[2]).haveOwnProperty('isBlockComment').and.to.be.ok;
		expect(lines[2]).haveOwnProperty('isBlockCommentEnd').and.to.be.not.ok;
		expect(lines[2]).haveOwnProperty('padSize').and.to.eq(1);

		expect(lines[3]).haveOwnProperty('isBlockCommentStart').and.to.be.not.ok;
		expect(lines[3]).haveOwnProperty('isBlockComment').and.to.be.ok;
		expect(lines[3]).haveOwnProperty('isBlockCommentEnd').and.to.be.ok;
		expect(lines[3]).haveOwnProperty('padSize').and.to.eq(1);

		expect(lines[4]).haveOwnProperty('isBlockCommentStart').and.to.be.not.ok;
		expect(lines[4]).haveOwnProperty('isBlockComment').and.to.be.not.ok;
		expect(lines[4]).haveOwnProperty('isBlockCommentEnd').and.to.be.not.ok;
		expect(lines[4]).haveOwnProperty('padSize').and.to.be.not.ok;
	});

	it('block comment start & end', () => {
		const lines = doc.create([
			'\tfoo',
			'/*',
			' *',
			' */',
			'bar',
		].join('\n'), {
			block_comment_end: '*/',
			block_comment_start: '/*',
		}).lines;

		expect(lines).to.have.length(5);
		expect(lines[0]).haveOwnProperty('isBlockCommentStart').and.to.be.not.ok;
		expect(lines[0]).haveOwnProperty('isBlockComment').and.to.be.not.ok;
		expect(lines[0]).haveOwnProperty('isBlockCommentEnd').and.to.be.not.ok;
		expect(lines[0]).haveOwnProperty('padSize').and.to.be.not.ok;

		expect(lines[1]).haveOwnProperty('isBlockCommentStart').and.to.be.ok;
		expect(lines[1]).haveOwnProperty('isBlockComment').and.to.be.not.ok;
		expect(lines[1]).haveOwnProperty('isBlockCommentEnd').and.to.be.not.ok;
		expect(lines[1]).haveOwnProperty('padSize').and.to.be.not.ok;

		expect(lines[2]).haveOwnProperty('isBlockCommentStart').and.to.be.not.ok;
		expect(lines[2]).haveOwnProperty('isBlockComment').and.to.be.ok;
		expect(lines[2]).haveOwnProperty('isBlockCommentEnd').and.to.be.not.ok;
		expect(lines[2]).haveOwnProperty('padSize').and.to.be.equal(1);

		expect(lines[3]).haveOwnProperty('isBlockCommentStart').and.to.be.not.ok;
		expect(lines[3]).haveOwnProperty('isBlockComment').and.to.be.ok;
		expect(lines[3]).haveOwnProperty('isBlockCommentEnd').and.to.be.ok;
		expect(lines[3]).haveOwnProperty('padSize').and.to.be.equal(1);

		expect(lines[4]).haveOwnProperty('isBlockCommentStart').and.to.be.not.ok;
		expect(lines[4]).haveOwnProperty('isBlockComment').and.to.be.not.ok;
		expect(lines[4]).haveOwnProperty('isBlockCommentEnd').and.to.be.not.ok;
		expect(lines[4]).haveOwnProperty('padSize').and.to.be.not.ok;
	});

	it('broken block comment', () => {
		const lines = doc.create([
			' */',
			' *',
			'/*',
		].join('\n'), {
			block_comment_end: '*/',
			block_comment_start: '/*',
		}).lines;

		expect(lines).to.have.length(3);
		expect(lines[0]).haveOwnProperty('isBlockComment').and.to.be.not.ok;
		expect(lines[0]).haveOwnProperty('isBlockCommentStart').and.to.be.not.ok;

		expect(lines[1]).haveOwnProperty('isBlockComment').and.to.be.not.ok;

		expect(lines[2]).haveOwnProperty('isBlockComment').and.to.be.not.ok;
		expect(lines[2]).haveOwnProperty('isBlockCommentEnd').and.to.be.not.ok;
	});

	it('config without block_comment', () => {
		const lines = doc.create([
			'<!--[if IE]>',
			'You are useing IE.',
			'<![endif]-->',
		].join('\n'), {
			block_comment_end: '<![endif]-->',
			block_comment_start: '<!--[if IE]>',
		}).lines;
		expect(lines[0]).haveOwnProperty('isBlockCommentStart').and.to.be.ok;
		expect(lines[1]).haveOwnProperty('isBlockComment').and.to.be.not.ok;
		expect(lines[1]).haveOwnProperty('padSize').and.to.be.equal(13);
		expect(lines[2]).haveOwnProperty('isBlockCommentEnd').and.to.be.ok;
	});
});
