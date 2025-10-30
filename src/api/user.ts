import { IPaging } from '@/interface';
import { IUser } from '@/types/IUser';
import request from '@/utils/request';

// 获取人机校验
export function fetchCaptchaGenerateWithKey() {
  return request.get('/user/captcha/generate-with-key');
}

export function fetchUserRegister({ username, password }) {
  return request.post('/user/register', {
    username,
    password,
    ancestors: 1,
  });
}

export function inviteAgentRegister(data) {
  return request.instance({
    url: '/inviteAgent/register',
    method: 'post',
    data: { ...data, is_client: true },
  });
}

export function fetchQrcodeLogin({ platform, exp }) {
  return request.post<{
    login_id: string;
    exp: any;
    platform: any;
    isLogin: boolean;
    token: string;
  }>('/user/qrcode_login', {
    platform,
    exp,
  });
}

// eslint-disable-next-line
export function fetchQrcodeLoginStatus({ platform, login_id }) {
  return request.get<{
    login_id: string;
    exp: any;
    platform: any;
    isLogin: boolean;
    token: string;
  }>('/user/qrcode_login_status', {
    // eslint-disable-next-line
    params: { platform, login_id },
  });
}

export function fetchUserIdLogin({ id, password, exp }) {
  return request.post('/user/id_login', {
    id,
    password,
    exp,
  });
}

export function fetchUserUsernameLogin({
  username,
  password,
  captchaKey,
  captchaCode,
  exp,
}) {
  return request.post('/user/username_login', {
    username,
    password,
    captcha_key: captchaKey,
    captcha_code: captchaCode,
    exp,
    is_client: true,
  });
}

export function fetchIdLogin({ id, password }) {
  return request.post('/user/login', {
    id,
    password,
  });
}

export function fetchUserInfo() {
  return request.get<IUser>('/user/get_user_info');
}

export function fetchFindUser(userId: number) {
  return request.get(`/user/find/${userId}`);
}

export function fetchUserList(params: { orderName: string; orderBy: string }) {
  return request.get<IPaging<IUser>>('/user/list', { params });
}

// 发送用户活跃心跳
export function fetchUserKeepAlive() {
  return request.get('/user/keep-alive');
}
