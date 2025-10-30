import { IPaging, IWallet } from '@/interface';
import request from '@/utils/request';

export function fetchWalletList(params) {
  return request.get<IPaging<IWallet>>('/wallet/list', {
    params,
  });
}

export function fetchMyWallet(params) {
  return request.get<IWallet>('/wallet/my_wallet', { params });
}

export function getBanks(params) {
  return request.get('/wallet/bank/list', { params });
}

// 获取用户银行卡列表
export const getBankCards = (params) => {
  return request.get('/wallet/userBankCard/list', { params });
};

export const createUserBankCard = (data) => {
  return request.post('/wallet/userBankCard/create', data);
};

// 创建充值记录
export const createRechargeRecord = (data) => {
  return request.post('/wallet/rechargeRecords/create', data);
};

// 获取充值记录
export const getRechargeRecords = (params) => {
  return request.get('/wallet/rechargeRecords/list', { params });
};

export function updateRecharge(data) {
  return request.put(`/wallet/rechargeRecords/update`, data);
}

export function getUseRechargeTarget() {
  return request.get('/wallet/getUseRechargeTarget');
}

// 创建提现记录
export const createWithdrawalRecord = (data: {
  user_id: number | undefined;
  bank_card_id: number;
  amount: number;
}) => {
  return request.post('/wallet/withdrawalRecords/create', data);
};

// 获取提现记录
export const getWithdrawalRecords = (params) => {
  return request.get('/wallet/withdrawalRecords/list', { params });
};
