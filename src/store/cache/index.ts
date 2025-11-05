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
    initTranslationsDict() {
      try {
        // 优先从 cookie 获取国际化数据以快速显示
        const cookieDict = getSysTranslationsDict();
        if (cookieDict) {
          console.log('从 cookie 获取国际化数据（快速显示）');
          this.sysTranslationsDict = cookieDict;
        }

        // 无论是否有cookie数据，都在后台异步获取最新数据（懒加载）
        // 这样可以确保即使页面有更新，字典也能同步更新
        console.log('后台异步获取最新国际化数据');

        // 使用setTimeout确保在页面渲染完成后再执行
        setTimeout(async () => {
          try {
            const res = await findDict(this.locale);
            const rows = res.data.rows;
            const newDict: Record<string, string> = {};

            // 构建新的字典
            for (let i = 0; i < rows.length; i += 1) {
              const key = rows[i].lg_key;
              const value = rows[i].dict_value;
              newDict[key] = value;
            }

            // 更新store中的数据
            this.sysTranslationsDict = { ...newDict };

            // 更新cookie缓存
            setSysTranslationsDict(newDict);
            console.log('国际化数据已在后台更新并缓存到 cookie');
          } catch (asyncError) {
            console.error('后台异步更新国际化字典失败:', asyncError);
            // 这里不显示错误，因为用户已经看到内容了
          }
        }, 0);
      } catch (error) {
        console.error('初始化国际化字典失败:', error);
        // 如果cookie获取也失败，设置默认值避免白屏
        if (
          !this.sysTranslationsDict ||
          Object.keys(this.sysTranslationsDict).length === 0
        ) {
          this.sysTranslationsDict = {};
        }
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
