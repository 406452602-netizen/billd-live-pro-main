import request from '@/utils/request';

export function getList() {
  return request.get('/sysLanguage/getList');
}

export function findDict(data: string) {
  return request.get(`/sysLanguage/findDict/${data}`);
}
