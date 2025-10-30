import { nameSpaceWrap } from '@/locales/util';

// 系统通用翻译
const sysTranslations = {
  'sys.captcha': '验证码',
  'sys.captcha.expired': '验证码已过期，请重新输入！',
  'sys.captcha.get.failed': '获取验证码失败，请重试',
};

// 模块翻译
export default {
  ...sysTranslations,
  ...nameSpaceWrap('common', {
    loading: '加载中...',
    allLoaded: '已全部加载',
    nonedata: '暂无数据',
    living: '直播中',
    wallet: '钱包',
    payMoney: '金额：{money}元',
    aliPayScanTip: '打开支付宝扫一扫',
    payValidity: 'Validity period of {minutes} minutes',
    joinKaiyunSportsDay: '加入开云体育第{days}天',
  }),
};
