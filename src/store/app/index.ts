import { UploadFileInfo } from 'naive-ui';
import { defineStore } from 'pinia';

import { DEFAULT_RATIO } from '@/constant';
import {
  IArea,
  IGlobalMsg,
  LiveLineEnum,
  LiveRenderEnum,
  MediaTypeEnum,
} from '@/interface';
import { mobileRouterName } from '@/router';
import { ILiveRoom } from '@/types/ILiveRoom';
import { isMSESupported } from '@/utils';

export type AppRootState = {
  wsInfo?: {
    host_list: {
      id: string;
      host: string;
      protocol: string;
    }[];
    index: number;
  };
  notification: IGlobalMsg[];
  innerHeight: number;
  useGoogleAd: boolean;
  usePayCourse: boolean;
  areaList: IArea[];
  treeAreaList: IArea[];
  flatAreaList: IArea[];
  playing: boolean;
  videoRatio: number;
  normalVolume: number;
  navList: { routeName: string; name: string }[];
  allTrack: {
    /** 1开启；2关闭 */
    audio: number;
    /** 1开启；2关闭 */
    video: number;
    id: string;
    deviceId?: string;
    mediaName: string;
    type: MediaTypeEnum;
    openEye: boolean;
    track?: MediaStreamTrack;
    stream?: MediaStream;
    streamid?: string;
    trackid?: string;
    canvasDom?: any;
    hidden?: boolean;
    muted?: boolean;
    volume?: number;
    videoEl?: HTMLVideoElement;
    imgInfo?: UploadFileInfo[];
    mediaInfo?: UploadFileInfo[];
    txtInfo?: { txt: string; color: string };
    timeInfo?: { color: string };
    stopwatchInfo?: { color: string };
    rect?: { top: number; left: number };
    scaleInfo: Record<number, { scaleX: number; scaleY: number }>;
  }[];
  videoControls: {
    pipMode?: boolean;
    pageFullMode?: boolean;
    fullMode?: boolean;
    renderMode?: boolean;
    line?: boolean;
    speed?: boolean;
    networkSpeed?: boolean;
    fps?: boolean;
    kbs?: boolean;
    resolution?: boolean;
    danmu?: boolean;
  };
  videoControlsValue: {
    renderMode?: LiveRenderEnum;
    pipMode?: boolean;
    pageFullMode?: boolean;
    kbs?: string;
    fps?: number;
    danmu?: boolean;
  };
  mseSupport: boolean;
  liveLine: LiveLineEnum;
  liveRoomInfo?: ILiveRoom;
  showLoginModal: boolean;
  disableSpeaking: Map<number, { exp: number; label: string }>;
  showSigninRedDot: boolean;
};

export const useAppStore = defineStore('app', {
  state: (): AppRootState => {
    return {
      wsInfo: undefined,
      innerHeight: 0,
      notification: [],
      useGoogleAd: false,
      usePayCourse: false,
      areaList: [],
      treeAreaList: [],
      flatAreaList: [],
      playing: false,
      videoRatio: DEFAULT_RATIO,
      videoControls: {
        danmu: true,
        speed: true,
        line: true,
        fps: true,
        resolution: true,
      },
      videoControlsValue: {
        renderMode: LiveRenderEnum.video,
        pipMode: false,
        pageFullMode: false,
        danmu: true,
      },
      normalVolume: 80,
      navList: [
        { routeName: mobileRouterName.h5, name: '频道' },
        { routeName: mobileRouterName.h5Shop, name: '商店' },
        { routeName: mobileRouterName.h5Rank, name: '排行' },
        { routeName: mobileRouterName.h5My, name: '我的' },
      ],
      allTrack: [],
      mseSupport: isMSESupported(),
      liveLine: LiveLineEnum.flv,
      liveRoomInfo: undefined,
      showLoginModal: false,
      disableSpeaking: new Map(),
      showSigninRedDot: false,
    };
  },
  actions: {
    setLiveRoomInfo(res: AppRootState['liveRoomInfo']) {
      this.liveRoomInfo = res;
    },
    setAllTrack(res: AppRootState['allTrack']) {
      this.allTrack = res;
    },
    getTrackInfo() {
      const res = { audio: 0, video: 0 };
      this.allTrack.forEach((item) => {
        // if (item.stream) {
        if (item.audio === 1) {
          res.audio += 1;
        }
        if (item.video === 1) {
          res.video += 1;
        }
        // }
      });
      return res;
    },
  },
});
