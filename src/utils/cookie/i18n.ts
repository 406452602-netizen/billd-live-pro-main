import cookies from 'js-cookie';

import { COOKIE_KEY } from '@/constant';

// 缓存过期时间（毫秒）- 24小时
const CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000;

/**
 * 获取存储在 cookie 中的国际化字典数据
 * @returns 国际化字典对象或 null
 */
export const getSysTranslationsDict = () => {
  try {
    const dictStr = cookies.get(COOKIE_KEY.sysTranslationsDict);
    if (dictStr) {
      // 验证数据是否过期
      const timestampStr = cookies.get(COOKIE_KEY.sysTranslationsDictTimestamp);
      if (timestampStr) {
        const timestamp = parseInt(timestampStr, 10);
        const now = Date.now();

        // 如果数据未过期，则返回
        if (now - timestamp < CACHE_EXPIRE_TIME) {
          return JSON.parse(dictStr);
        }
        // 数据已过期，清除缓存
        clearSysTranslationsDict();
      }
    }
  } catch (error) {
    console.error('获取国际化字典数据失败:', error);
  }
  return null;
};

/**
 * 将国际化字典数据存储到 cookie 中
 * @param dict 国际化字典对象
 */
export const setSysTranslationsDict = (dict: Record<string, string>) => {
  try {
    cookies.set(COOKIE_KEY.sysTranslationsDict, JSON.stringify(dict));
    cookies.set(COOKIE_KEY.sysTranslationsDictTimestamp, Date.now().toString());
  } catch (error) {
    console.error('存储国际化字典数据失败:', error);
  }
};

/**
 * 清除存储在 cookie 中的国际化字典数据
 */
export const clearSysTranslationsDict = () => {
  try {
    cookies.remove(COOKIE_KEY.sysTranslationsDict);
    cookies.remove(COOKIE_KEY.sysTranslationsDictTimestamp);
  } catch (error) {
    console.error('清除国际化字典数据失败:', error);
  }
};
