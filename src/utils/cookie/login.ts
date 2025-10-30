import cookies from 'js-cookie';

import { COOKIE_KEY } from '@/constant';

export const getRememberLogin = () => {
  return cookies.get(COOKIE_KEY.rememberLogin);
};

export const setRememberLogin = (val) => {
  cookies.set(COOKIE_KEY.rememberLogin, val);
};

export const clearRememberLogin = () => {
  cookies.remove(COOKIE_KEY.rememberLogin);
};
