import request from '@/utils/request.ts';

export function adCarouselList() {
  return request.instance({
    url: '/adCarousel/getAllList',
    method: 'get',
  });
}
