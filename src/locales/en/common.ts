import { nameSpaceWrap } from '@/locales/util';

// System common translations
const sysTranslations = {
  'sys.captcha': 'Captcha',
  'sys.captcha.expired': 'Captcha has expired, please re-enter!',
  'sys.captcha.get.failed': 'Failed to get captcha, please retry',
};

// Module translations
export default {
  ...sysTranslations,
  ...nameSpaceWrap('common', {
    loading: 'loading...',
    allLoaded: 'all loaded',
    nonedata: 'none data',
    living: 'living',
    wallet: 'wallet',
    payMoney: 'amount: {money} ￥',
    aliPayScanTip: 'open alipay to scan',
    payValidity: 'pay  validity {minutes}minute',
    joinKaiyunSportsDay: 'Joined Kaiyun Sports for {days} days',
  }),
};
