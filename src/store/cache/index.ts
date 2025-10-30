import { defineStore } from 'pinia';

import { findDict, getList } from '@/api/sysLanguage';
import { lsKeyPrefix } from '@/constant';
import { AppRootState } from '@/store/app';
import { ISysTranslationsDict } from '@/types/ILanguage.ts';

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
      await findDict(this.locale).then((res) => {
        const rows = res.data.rows;
        for (let i = 0; i < rows.length; i += 1) {
          this.sysTranslationsDict[rows[i].lg_key] = rows[i].dict_value;
        }

        console.log('this.sysTranslationsDict', this.sysTranslationsDict);
      });
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
