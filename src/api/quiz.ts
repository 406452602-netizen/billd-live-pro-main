import request from '@/utils/request.ts';

export function fetchQuizMatchesList() {
  return request.instance({
    url: '/quiz/matches/room/list',
    method: 'get',
  });
}

export function findMatches(matchId) {
  return request.instance({
    url: `/quiz/matches/${matchId}`,
    method: 'get',
  });
}

export function createVote(data) {
  return request.instance({
    url: `/quiz/votes/create`,
    method: 'post',
    data,
  });
}

export function votesStation(params) {
  return request.instance({
    url: `/quiz/votes/statistics`,
    method: 'get',
    params,
  });
}

export function fetchQuizVotesList(data) {
  return request.instance({
    url: '/quiz/votes/list',
    method: 'post',
    data,
  });
}

export function seasonsPublicList(type) {
  return request.instance({
    url: `/quiz/seasons/publicList/${type}`,
    method: 'get',
  });
}
