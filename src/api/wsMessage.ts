import { IList, IPaging, IWsMessage, IWsUserMessage } from '@/interface';
import request from '@/utils/request';

export function fetchGetWsMessageList(params: IList<IWsMessage>) {
  return request.get<IPaging<IWsMessage>>('/ws_message/list', {
    params,
  });
}

export function fetchGetWsUserMessageList(data: IWsUserMessage) {
  return request.post('/ws_user_message/customerService/list', data);
}
