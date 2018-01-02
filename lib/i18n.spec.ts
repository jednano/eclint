import * as proxyquire from 'proxyquire';
import * as common from './test-common';
const expect = common.expect;
/* tslint:disable:no-unused-expression */

function i18n(lang) {
	return proxyquire('./i18n', {
		'os-locale': {
			sync: () => lang,
		},
	});
}
describe('eclint i18n', () => {
	it('zh_CN', () => {
		expect(i18n('zh_CN')('CommandError: Missing required sub-command.')).to.be.equal('命令错误: 缺少必须的子命令。');
		const message = 'string that not exist in locales';
		expect(i18n('zh_CN')(message)).to.be.equal(message);
	});
	it('ja_JP', () => {
		const message = 'CommandError: Missing required sub-command.';
		expect(i18n('ja_JP')(message)).to.be.equal(message);
	});
});
