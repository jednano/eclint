import common = require('./test-common');
import proxyquire = require('proxyquire');
const expect = common.expect;

function i18n(lang) {
	return proxyquire('./i18n', {
		'os-locale': {
			sync: () => lang,
		}
	});
}
describe('eclint i18n', function() {
	it('zh_CN', () => {
		expect(i18n('zh_CN')('CommandError: Missing required sub-command.')).to.be.equal('命令错误: 缺少必须的子命令。');
	});
	it('ja_JP', () => {
		const message = 'CommandError: Missing required sub-command.';
		expect(i18n('ja_JP')(message)).to.be.equal(message);
	});
});
