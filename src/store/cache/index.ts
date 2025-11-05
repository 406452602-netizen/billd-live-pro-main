import { defineStore } from 'pinia';

import { findDict, getList } from '@/api/sysLanguage';
import { lsKeyPrefix } from '@/constant';
import { AppRootState } from '@/store/app';
import { ISysTranslationsDict } from '@/types/ILanguage.ts';
import { getSysTranslationsDict, setSysTranslationsDict } from '@/utils/cookie';

export type PiniaCacheRootState = {
  sysTranslationsDict: ISysTranslationsDict[];
  locale: string;
  muted: boolean;
  volume: number;
  'resource-list': AppRootState['allTrack'];
  localeList: {
    label: string;
    value: string;
  }[];
};

export const useCacheStore = defineStore(`${lsKeyPrefix}pinia-cache`, {
  persist: {
    key: `${lsKeyPrefix}pinia-cache`,
  },
  state: (): {
    locale: string;
    muted: boolean;
    volume: number;
    'resource-list': any[];
    sysTranslationsDict: NonNullable<unknown>;
    localeList: any[];
  } => {
    return {
      locale: 'en',
      muted: true,
      volume: 80,
      'resource-list': [],
      sysTranslationsDict: {},
      localeList: [],
    };
  },
  actions: {
    setResourceList(res: PiniaCacheRootState['resource-list']) {
      this['resource-list'] = res;
    },
    setLocale(locale: string) {
      this.locale = locale;
      this.initTranslationsDict();
    },
    async initTranslationsDict() {
      try {
        // 优先从 cookie 获取国际化数据
        const cookieDict = getSysTranslationsDict();
        if (cookieDict) {
          console.log('从 cookie 获取国际化数据');
          this.sysTranslationsDict = cookieDict;
          return;
        }

        // 如果 cookie 中没有数据或数据已过期，则从后台获取
        console.log('从后台获取国际化数据');
        await findDict(this.locale).then((res) => {
          const rows = res.data.rows;
          const newDict: Record<string, string> = {};
          
          for (let i = 0; i < rows.length; i += 1) {
            const key = rows[i].lg_key;
            const value = rows[i].dict_value;
            newDict[key] = value;
            this.sysTranslationsDict[key] = value;
          }

          // 将获取到的数据存储到 cookie 中
          setSysTranslationsDict(newDict);
          console.log('国际化数据已缓存到 cookie');
        });
      } catch (error) {
        console.error('初始化国际化字典失败:', error);
      }
    },
    async initLocaleList() {
      await getList().then((res) => {
        this.localeList = res.data.rows.map((item) => {
          return {
            label: item.label,
            value: item.code,
          };
        });
      });
    },
  },
});
