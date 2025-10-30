import { defineStore } from 'pinia';

import {
  fetchUserIdLogin,
  fetchUserInfo,
  fetchUserUsernameLogin,
} from '@/api/user';
import { fetchMyWallet } from '@/api/wallet';
import { IAuth, IRole } from '@/interface';
import { IUser } from '@/types/IUser';
import cache from '@/utils/cache';

type UserRootState = {
  userInfo?: IUser;
  token?: string | null;
  roles?: IRole[];
  auths?: IAuth[];
};

export const useUserStore = defineStore('user', {
  state: (): UserRootState => {
    return {
      token: cache.getStorageExp('token'),
      roles: undefined,
      userInfo: undefined,
      auths: undefined,
    };
  },
  actions: {
    setUserInfo(res: UserRootState['userInfo']) {
      this.userInfo = res;
    },
    setToken(res: UserRootState['token'], exp: number) {
      cache.setStorageExp('token', res, exp);
      this.token = res;
    },
    setRoles(res: UserRootState['roles']) {
      this.roles = res;
    },
    setAuths(res: UserRootState['auths']) {
      this.auths = res;
    },
    logout() {
      cache.clearStorage('token');
      this.token = undefined;
      this.userInfo = undefined;
      this.roles = undefined;
    },
    async idLogin({ id, password }) {
      try {
        const exp = 24 * 7;
        const { data: token } = await fetchUserIdLogin({
          id,
          password,
          exp,
        });
        this.setToken(token, exp);
        return token;
      } catch (error: any) {
        // 错误返回401，全局的响应拦截会打印报错信息
        console.log(error);
        return null;
      }
    },
    async usernameLogin({ username, password, captchaKey, captchaCode }) {
      try {
        const exp = 24 * 7;
        const { data: token } = await fetchUserUsernameLogin({
          username,
          password,
          exp,
          captchaKey,
          captchaCode,
        });
        this.setToken(token, exp);
      } catch (error: any) {
        // 错误返回401，全局的响应拦截会打印报错信息
        console.log(error);
        throw error; // 抛出错误以便上层处理
      }
    },
    async updateMyWallet() {
      const res = await fetchMyWallet({});
      if (res.code === 200) {
        if (this.userInfo?.wallet?.balance) {
          this.userInfo.wallet.balance = res.data.balance;
        }
      }
    },
    async getUserInfo() {
      try {
        const { code, data } = await fetchUserInfo();
        this.setUserInfo(data);
        this.setRoles(data.roles);
        this.setAuths(data.auths);
        return { code, data };
      } catch (error) {
        return error;
      }
    },
  },
});
