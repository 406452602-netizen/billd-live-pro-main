import type { IGameTransactionRecord } from '@/interface';
import { IPaging } from '@/interface';
import request from '@/utils/request';

export const getGameTransactionList = (params) => {
  return request.get<IPaging<IGameTransactionRecord>>(
    '/gameTransactionRecord/list',
    { params }
  );
};

/**
 * 获取游戏列表
 */
export const getGames = () => {
  return request.get('/gameApi/getGames');
};

/**
 * 获取游戏大厅连接
 */
export const getGameBetLobby = (params?: {
  gameId?: string | number;
  id?: string | number;
}) => {
  return request.get('/gameApi/betLobby', { params });
};

/**
 * 获取集成游戏列表
 */
export const getGameIntegrations = (id: string | number) => {
  return request.get(`/gameApi/getGameIntegrations/${id}`);
};

/**
 * 获取游戏余额列表
 */
export const getGameBalanceList = () => {
  return request.get('/gameApi/balanceList');
};

/**
 * 一键提取游戏余额到中心钱包
 */
export const withdrawGameBalance = (data) => {
  return request.put('/gameApi/withdraw', data);
};

export const withdrawGameBalanceAll = () => {
  return request.put('/gameApi/withdrawAll');
};

/**
 * 获取游戏名称和ID列表（包含logo和gameId）
 */
export const getGamesNames = () => {
  return request.get('/gameApi/getGamesNames');
};

/**
 * 获取游戏消费记录列表
 */
export const getGameConsumptionList = (params) => {
  return request.get('/gameTransactionRecord/gameConsumptionList', { params });
};
