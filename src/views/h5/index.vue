<template>
  <div class="h5-wrap">
    <HeadCpt></HeadCpt>

    <!-- 游戏加载层 -->
    <div
      v-if="gameLoading"
      class="game-loading-overlay"
    >
      <div class="game-loading-content">
        <div class="game-loading-spinner"></div>
        <p class="game-loading-text">
          {{ currentLocale === 'zh' ? '正在进入游戏...' : 'Entering game...' }}
        </p>
        <p
          v-if="currentGame"
          class="game-loading-name"
        >
          {{ getLocalizedGameName(currentGame) }}
        </p>
      </div>
    </div>

    <!-- 临时游戏链接按钮（当window.open被拦截时显示） -->
    <n-modal
      v-model:show="showGameButton"
      preset="dialog"
      :title="sysTranslationsDict['sys.open']"
      :close-on-esc="false"
      :close-on-click-modal="false"
    >
      <div style="text-align: center; padding: 20px">
        <p>
          {{ sysTranslationsDict['sys.open.window.error'] }}
        </p>
        <n-button
          type="primary"
          size="large"
          style="margin-top: 20px"
          @click="handleManualOpenGame"
        >
          {{ sysTranslationsDict['sys.open'] }}
        </n-button>
      </div>
    </n-modal>
    <!--    <div-->
    <!--      class="swiper"-->
    <!--      :style="{-->
    <!--        backgroundImage: `url(${currentSwiper.bgi})`,-->
    <!--      }"-->
    <!--      @click="openToTarget(currentSwiper.url)"-->
    <!--    ></div>-->
    <n-carousel
      direction="horizontal"
      autoplay
      dot-type="line"
      dot-placement="bottom"
      style="height: 240px"
    >
      <img
        v-for="(item, index) in adList"
        class="carousel-img"
        :src="AXIOS_BASEURL + item.ad_image"
        :key="index"
        @click="goUrl(item)"
      />
    </n-carousel>
    <div class="user-info">
      <div class="info">
        <div
          v-if="userStore.userInfo"
          class="user"
        >
          <!--          <Avatar-->
          <!--            :url="userStore.userInfo.avatar"-->
          <!--            :name="userStore.userInfo.username"-->
          <!--            :size="30"-->
          <!--          ></Avatar>-->
          <div style="flex: 1; color: #8e8b8b">
            {{ userStore.userInfo.username }}
          </div>
        </div>
        <!--        <div-->
        <!--          v-else-->
        <!--          class="btn"-->
        <!--          @click="appStore.showLoginModal = true"-->
        <!--        >-->
        <!--          {{ sysTranslationsDict['sys.login'] }}-->
        <!--        </div>-->
        <div
          v-else
          class="btn"
          @click="router.push({ name: mobileRouterName.h5Login })"
        >
          <!-- sys.login: 登录文本（中英文切换） -->
          <n-flex vertical>
            <!-- sys.have.not: 未提示文本, sys.login: 登录文本（中英文切换） -->
            <div>
              {{
                `${sysTranslationsDict['sys.have.not']} ${sysTranslationsDict['sys.login']}`
              }}
            </div>
            <!-- sys.login: 登录文本, sys.register: 注册文本, sys.view: 查看文本（中英文切换） -->
            <div style="color: #8e8b8b; font-size: 12px">
              {{
                `${sysTranslationsDict['sys.login']}/${sysTranslationsDict['sys.register']}
                ${sysTranslationsDict['sys.view']}`
              }}
            </div>
          </n-flex>
        </div>
        <div
          v-if="userStore.userInfo"
          class="waller"
        >
          <img
            src="@/assets/img/coin.png"
            width="20"
            height="20"
          />
          <span>{{ userStore.userInfo.wallet?.balance }}</span>
        </div>
      </div>
      <n-flex
        justify="space-around"
        :size="[6, 12]"
        align="center"
      >
        <div
          class="menu"
          @click="jumpPage(mobileRouterName.h5DepositMoney)"
        >
          <div class="menu-img">
            <img
              src="@/assets/img/home/cunkuan.png"
              width="40"
              height="40"
            />
          </div>
          <!-- sys.deposit.money: 存款文本（中英文切换） -->
          <div class="menu-title">
            {{ sysTranslationsDict['sys.deposit.money'] }}
          </div>
        </div>

        <div
          class="menu"
          @click="jumpPage(mobileRouterName.h5WithdrawMoney)"
        >
          <div class="menu-img">
            <img
              src="@/assets/img/home/qukuan.png"
              width="40"
              height="40"
            />
          </div>
          <!-- sys.withdraw.money: 提款文本（中英文切换） -->
          <div class="menu-title">
            {{ sysTranslationsDict['sys.withdraw.money'] }}
          </div>
        </div>

        <div
          class="menu"
          @click="jumpPage(mobileRouterName.h5GameBalance)"
        >
          <div class="menu-img">
            <img
              src="@/assets/img/home/vip.png"
              width="40"
              height="40"
            />
          </div>
          <!-- sys.convert: 转换文本（中英文切换） -->
          <div class="menu-title">
            {{ sysTranslationsDict['sys.convert'] }}
          </div>
        </div>
        <div class="menu">
          <div class="menu-img">
            <img
              src="@/assets/img/home/download.png"
              width="40"
              height="40"
            />
          </div>
          <!-- sys.promotion: 推广文本（中英文切换） -->
          <div class="menu-title">
            {{ sysTranslationsDict['sys.promotion'] }}
          </div>
        </div>
      </n-flex>
    </div>
    <router-link :to="{ name: mobileRouterName.h5CompetitionList }">
      <img
        src="@/assets/img/demo_123.png"
        style="width: 90vw; margin: auto 5vw auto 5vw"
      />
    </router-link>
    <!-- 游戏列表展示区域 -->
    <div
      class="game-list-section"
      style="margin: 20px 0 30px"
    >
      <div
        class="section-title"
        style="padding: 0 5vw; margin-bottom: 15px"
      >
        <!-- sys.game.list: 游戏列表文本（中英文切换） -->
        <h3 style="margin: 0; font-size: 18px; color: #333">
          {{ sysTranslationsDict['sys.game.list'] }}
        </h3>
      </div>

      <div
        v-if="loadingGames"
        style="text-align: center; padding: 40px"
      >
        <div style="color: #999">加载中...</div>
      </div>

      <div
        v-else-if="gameList.length === 0"
        style="text-align: center; padding: 40px"
      >
        <div style="color: #999">暂无游戏数据</div>
      </div>

      <div
        v-else
        class="game-grid"
        style="padding: 0 5vw"
      >
        <div
          v-for="game in gameList"
          :key="game.gameId || game.game_id"
          class="game-item"
          @click="
            game.is_integration
              ? jumpIntegrationGame(game.gameId || game.game_id)
              : jumpGame(game.gameId || game.game_id)
          "
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            margin: 10px;
            border-radius: 8px;
            background-color: #f5f5f5;
            cursor: pointer;
            transition: all 0.3s;
            width: calc(25% - 20px);
            float: left;
          "
          :style="{
            backgroundColor:
              gameList.indexOf(game) % 4 === 0
                ? '#e6f7ff'
                : gameList.indexOf(game) % 4 === 1
                  ? '#fff7e6'
                  : gameList.indexOf(game) % 4 === 2
                    ? '#f6ffed'
                    : '#fff0f6',
          }"
        >
          <div
            class="game-logo"
            style="margin-bottom: 8px"
          >
            <img
              v-if="game.icon"
              :src="game.icon"
              style="
                width: 60px;
                height: 60px;
                object-fit: contain;
                border-radius: 4px;
              "
            />
            <div
              v-else
              style="
                width: 60px;
                height: 60px;
                background-color: #ddd;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #999;
              "
            >
              {{ game.game_name?.charAt(0) || '游' }}
            </div>
          </div>
          <div
            class="game-name"
            style="
              font-size: 14px;
              text-align: center;
              color: #333;
              word-break: break-all;
            "
          >
            {{ game.game_name }}
          </div>
        </div>
        <div style="clear: both"></div>
      </div>
    </div>

    <!--    &lt;!&ndash; 旧的游戏入口（暂时保留以便过渡） &ndash;&gt;-->
    <!--    <img-->
    <!--      src="@/assets/img/demo_123.png"-->
    <!--      style="width: 90vw; margin: auto 5vw auto 5vw"-->
    <!--      @click="-->
    <!--        gameList.length > 0-->
    <!--          ? jumpGame(gameList[0].gameId || gameList[0].game_id)-->
    <!--          : ''-->
    <!--      "-->
    <!--      v-if="!loadingGames && gameList.length > 0"-->
    <!--    />-->
    <!--    <div class="type-list">-->
    <!--      <div-->
    <!--        v-for="(item, index) in liveRoomList"-->
    <!--        :key="index"-->
    <!--        class="item"-->
    <!--      >-->
    <!--        <div-->
    <!--          class="title"-->
    <!--          @click.stop-->
    <!--        >-->
    <!--          <div class="left">{{ item.name }}</div>-->
    <!--          <div-->
    <!--            class="right"-->
    <!--            @click="showAll(item)"-->
    <!--          >-->
    <!--            {{ sysTranslationsDict['home.view.more'] }}-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="live-room-list">-->
    <!--          <template-->
    <!--            v-for="iten in item.live_rooms"-->
    <!--            :key="iten.id"-->
    <!--          >-->
    <!--            <MobileLiveRoomItem-->
    <!--              :liveroom="iten"-->
    <!--              :user="iten?.user"-->
    <!--              @click="goRoom(iten)"-->
    <!--            ></MobileLiveRoomItem>-->
    <!--          </template>-->
    <!--          <div-->
    <!--            v-if="!item.live_rooms?.length"-->
    <!--            class="null"-->
    <!--          >-->
    <!--            {{ sysTranslationsDict['sys.no.data'] }}-->
    <!--          </div>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--      <div class="item">-->
    <!--        <div-->
    <!--          class="title"-->
    <!--          @click.stop-->
    <!--        >-->
    <!--          <div class="left">b站直播</div>-->
    <!--          <div-->
    <!--            class="right"-->
    <!--            @click="showAllBilibili()"-->
    <!--          >-->
    <!--            {{ sysTranslationsDict['home.view.more'] }}-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="live-room-list">-->
    <!--          <template-->
    <!--            v-for="item in bilibiliLiveRoomList"-->
    <!--            :key="item.id"-->
    <!--          >-->
    <!--            <MobileLiveRoomItem-->
    <!--              :liveroom="{ ...item.live_room, live: {} }"-->
    <!--              :user="item.live_room?.users?.[0]"-->
    <!--              @click="goRoom(item, true)"-->
    <!--            ></MobileLiveRoomItem>-->
    <!--          </template>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </div>-->
  </div>
</template>

<script lang="ts" setup>
// import { openToTarget } from 'billd-utils';
import { computed, onMounted, onUnmounted, ref } from 'vue';
// import { useI18n } from 'vue-i18n';

// import { fetchAreaLiveRoomList } from '@/api/area';
// import { fetchLiveBilibiliGetUserRecommend } from '@/api/bilibili';
import { adCarouselList } from '@/api/ad.ts';
// eslint-disable-next-line import/order
import { getGameBetLobby, getGamesNames } from '@/api/game.ts';
// eslint-disable-next-line import/order
import { fetchUserKeepAlive } from '@/api/user';

// import {
//   IArea,
//   // ILive,
//   // SwitchEnum
// } from '@/interface';
import HeadCpt from '@/layout/mobile/head/index.vue';
import router, { mobileRouterName } from '@/router';
import { AXIOS_BASEURL } from '@/spec-config';
import { useAppStore } from '@/store/app';
import { useCacheStore } from '@/store/cache';
import { useUserStore } from '@/store/user';
// import {
//   ILiveRoom,
//   // LiveRoomStatusEnum,
// } from '@/types/ILiveRoom';

const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});
const appStore = useAppStore();
const userStore = useUserStore();
const cacheStore = useCacheStore();

// const liveRoomList = ref<IArea[]>([]);
const adList = ref<any[]>([]);
const gameList = ref<any[]>([]);
const loadingGames = ref(false);
// const { t } = useI18n();

// 计算当前语言
const currentLocale = computed(() => {
  return cacheStore.locale || 'en';
});

// 游戏链接相关状态
const showGameButton = ref(false);
const gameUrl = ref('');

// 心跳检测相关
const keepAliveTimer = ref<NodeJS.Timeout | null>(null);
const keepAliveDelay = 30000; // 10秒心跳间隔

// 游戏加载相关
const gameLoading = ref(false);
const currentGame = ref<any>(null);

// 获取游戏的本地化名称
const getLocalizedGameName = (game: any) => {
  if (!game) return '';

  if (game.gameNameMappings && game.gameNameMappings.length) {
    // 根据当前语言查找对应的名称
    const mapping = game.gameNameMappings.find((item: any) =>
      item.languageCode.includes(currentLocale.value)
    );

    if (mapping) {
      return mapping.text;
    }
  }

  // 默认返回游戏名称或ID
  return game.gameName || game.game_name || `游戏 ${game.gameID || game.id}`;
};

// const swiperList = ref([
//   {
//     id: 1,
//     txt: '广告位1',
//     bgi: `https://resource.hsslive.cn/billd-live/image/aa51fe9093c4c6887931d5e9224f0f07.webp`,
//     url: COMMON_URL.payCoursesArticle,
//   },
// ]);
const swiperTimer = ref();

// 处理手动打开游戏
const handleManualOpenGame = () => {
  if (gameUrl.value) {
    try {
      const newWindow = window.open(gameUrl.value, '_blank');
      if (newWindow) {
        newWindow.focus();
        showGameButton.value = false;
      }
    } catch (error) {
      console.error('手动打开游戏时出错:', error);
    }
  }
};

// 开始用户活跃检测
const startKeepAlive = () => {
  // 停止之前的定时器（如果存在）
  if (keepAliveTimer.value) {
    clearInterval(keepAliveTimer.value);
  }

  // 创建定时发送心跳的函数
  const sendHeartbeat = async () => {
    try {
      await fetchUserKeepAlive();
    } catch (error) {
      console.error('发送心跳失败:', error);
    }
  };

  // 设置定时器，定期发送心跳
  keepAliveTimer.value = setInterval(sendHeartbeat, keepAliveDelay);
};

// 停止用户活跃检测
const stopKeepAlive = () => {
  if (keepAliveTimer.value) {
    clearInterval(keepAliveTimer.value);
    keepAliveTimer.value = null;
  }
};

function jumpGame(gameId: string | number) {
  // 找到当前点击的游戏对象
  const game = gameList.value.find((g) => g.gameID === gameId);

  gameLoading.value = true;
  currentGame.value = game;

  getGameBetLobby({ gameId })
    .then((res) => {
      gameLoading.value = false;
      currentGame.value = null;

      if (res.code === 200 && res.data) {
        userStore.getUserInfo();

        // 存储游戏URL以便在需要时使用
        gameUrl.value = res.data;

        // 解决iOS中window.open被拦截的问题
        // 方法1：直接打开窗口（优先）
        try {
          // 在用户交互上下文中直接打开窗口
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            // 立即设置location，避免被拦截
            newWindow.location.href = res.data;
            // 启动一个定时器检查窗口是否被关闭
            if (newWindow && !newWindow.closed) {
              newWindow.focus();
            } else {
              // 如果窗口被关闭，可能是被拦截了，显示手动打开按钮
              showGameButton.value = true;
              console.log('窗口可能被拦截，显示手动打开按钮');
            }
          } else {
            // 方法2：如果窗口创建失败，提示用户手动操作
            console.error('无法打开新窗口，可能被浏览器拦截');
            showGameButton.value = true;
            window.$message.warning(
              '浏览器阻止了新窗口打开，请使用下方按钮手动打开游戏'
            );
          }
        } catch (error) {
          console.error('打开新窗口失败:', error);
          showGameButton.value = true;
          window.$message.warning('打开游戏时出错，请使用下方按钮手动打开游戏');
        }

        // 启动活跃检测
        startKeepAlive();
      } else {
        // 失败时停止心跳检测
        stopKeepAlive();
        console.error('获取游戏大厅连接失败', res);
        window.$message.error('获取游戏大厅连接失败');
      }
    })
    .catch((error) => {
      setTimeout(() => {
        gameLoading.value = false;
        currentGame.value = null;

        // 异常时停止心跳检测
        stopKeepAlive();
        console.error('获取游戏大厅连接异常', error);
        window.$message.error('获取游戏大厅连接异常');
      }, 1000);
    });
}

function jumpIntegrationGame(gameId: string | number) {
  // 跳转到新页面查看集成游戏内容
  // 这里使用router.push跳转到一个专门的集成游戏页面
  router.push({
    name: mobileRouterName.h5IntegrationGame, // 假设这是集成游戏页面的路由名称
    params: { gameId }, // 传递游戏ID参数
  });
}

function jumpPage(item) {
  router.push({
    name: item,
  });
}

function goUrl(item) {
  if (item && item.ad_url) {
    // 若 item 对象存在且包含 url 属性，则跳转到该 URL
    window.location.href = item.ad_url;
  } else {
    console.warn('未提供有效的跳转 URL');
  }
}

// 页面失焦时暂停心跳检测
const handlePageBlur = () => {
  // 用户离开页面时不停止心跳检测，保持活跃
};

// 页面获得焦点时恢复心跳检测
const handlePageFocus = () => {
  // 用户回到页面时停止心跳检测
  stopKeepAlive();
};

onMounted(() => {
  // getLiveRoomList();
  // let num = 0;
  // swiperTimer.value = setInterval(() => {
  //   num += 1;
  //   if (num > swiperList.value.length - 1) {
  //     num = 0;
  //   }
  //   currentSwiper.value = swiperList.value[num];
  // }, 3000);
  // handleBilibilData();
  console.log(sysTranslationsDict.value['sys.login']);
  getAdList();
  getGameList();

  // 添加页面焦点事件监听
  window.addEventListener('blur', handlePageBlur);
  window.addEventListener('focus', handlePageFocus);
});

onUnmounted(() => {
  clearInterval(swiperTimer.value);
  appStore.showLoginModal = false;

  // 页面卸载时停止心跳检测
  stopKeepAlive();

  // 清理事件监听器
  window.removeEventListener('blur', handlePageBlur);
  window.removeEventListener('focus', handlePageFocus);
});

// function getMatchList() {
//   fetchQuizMatchesList().then((res) => {
//     if (res.code === 200) {
//       console.log('getMatchList', res.data);
//       matchList.value = res.data;
//     }
//   });
// }

function getGameList() {
  loadingGames.value = true;
  getGamesNames()
    .then((res) => {
      if (res.code === 200 && res.data && res.data.rows) {
        gameList.value = res.data.rows;
      }
    })
    .catch((error) => {
      console.error('获取游戏列表失败', error);
      window.$message.error('获取游戏列表失败');
    })
    .finally(() => {
      loadingGames.value = false;
    });
}

function getAdList() {
  adCarouselList().then((res) => {
    if (res.code === 200) {
      adList.value = res.data;
    }
  });
}

// async function handleBilibilData() {
//   let arr: any = [];
//   try {
//     const res = await fetchLiveBilibiliGetUserRecommend({
//       page: 1,
//       page_size: 4,
//       platform: 'web',
//     });
//     // const list = res.data?.list;
//     const list = res?.data?.data?.list;
//     if (list) {
//       arr = list.map((item) => {
//         return {
//           id: item.roomid,
//           live_room: {
//             id: item.roomid,
//             name: item.title,
//             cover_img: item.cover,
//             users: [{ username: item.uname, avatar: item.user_cover }],
//             areas: [{ name: item.area_name }],
//           },
//         };
//       });
//     }
//   } catch (error) {
//     console.log(error);
//   }
//   bilibiliLiveRoomList.value = arr;
// }
</script>

<style lang="scss" scoped>
.h5-wrap {
  //background-color: #f4f4f4;

  background: white;

  .logo-bar {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 20px;
    height: 40px;
    border-bottom: 1px solid #e7e7e7;
    background-color: white;

    .logo {
      width: 90px;
      height: 36px;

      @include setBackground('@/assets/img/logo-txt.png');
    }
  }

  .nav-list {
    display: flex;
    align-items: center;
    height: 40px;
    background-color: white;
    line-height: 40px;

    .item {
      position: relative;
      margin: 0 20px;

      &.active {
        &::after {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 4px;
          background-color: $theme-color-gold;
          content: '';
        }
      }
    }
  }

  .swiper {
    width: 100vw;
    height: calc(100vw / $video-ratio);
    background-color: #f4f4f4;
    @extend %coverBg;
  }

  .type-list {
    .item {
      margin: 15px 0;
      padding: 15px;
      background-color: white;

      .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;

        .right {
          color: #999;
          font-size: 14px;
        }
      }

      .live-room-list {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: space-between;

        .live-room {
          display: inline-block;
          margin-bottom: 10px;
          width: 48%;
          height: 130px;

          .cover {
            position: relative;
            overflow: hidden;
            width: 100%;
            height: 100px;
            border-radius: 8px;

            @extend %coverBg;

            .living-ico {
              position: absolute;
              top: 0px;
              left: 0px;
              z-index: 10;
              padding: 0 10px;
              height: 20px;
              border-radius: 8px 0 10px;
              background-color: $theme-color-gold;
              color: white;
              text-align: center;
              font-size: 12px;
              line-height: 20px;
            }

            .cdn-ico {
              position: absolute;
              top: -12px;
              right: -12px;
              z-index: 2;
              width: 70px;
              height: 22px;
              background-color: #f87c48;
              transform: rotate(45deg);
              transform-origin: bottom;

              .txt {
                margin-left: 18px;
                background-image: initial !important;
                color: white;
                font-size: 10px;
                transform: scale(0.83333) translate(2px, 3px);
              }
            }

            .txt {
              position: absolute;
              bottom: 0;
              left: 0;
              box-sizing: border-box;
              padding: 4px 8px;
              width: 100%;
              border-radius: 0 0 4px 4px;
              background-image: linear-gradient(
                180deg,
                rgba(0, 0, 0, 0) 0,
                rgba(0, 0, 0, 0.32) 100%
              );
              color: white;
              text-align: initial;
              font-size: 13px;

              @extend %singleEllipsis;
            }
          }

          .desc {
            margin-top: 4px;
            font-size: 14px;

            @extend %singleEllipsis;
          }
        }
      }
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  //padding: 5px;
  > div {
    border-radius: 5px;
    height: 65px;
  }

  > div:first-child {
    //background-color: #eaf4fe;
    padding: 1vh 0 1vh 5vw;
  }

  > div:last-child {
    border-radius: 5px;
    //background-color: #eaf4fe;
    padding: 1vh 5vw 1vh 0;
    height: 65px;
  }

  .info {
    > .user {
      display: flex;
      align-items: center;
      gap: 20px;
      justify-content: center;
    }

    > .waller {
      margin-top: 15px;
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
  }
}

.menu {
  width: 12vw;
  height: 10vh;
}

.menu-title {
  font-size: 10px;
  align-items: center;
  text-align: center;
}

.carousel-img {
  height: 240px;
  width: 100vw;
  align-items: center;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.menu-img {
  // 添加居中对齐样式
  display: flex;
  justify-content: center;
  align-items: center;
  // 可根据需要添加固定尺寸
  width: 100%;
}

// 游戏加载层样式
.game-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.game-loading-content {
  text-align: center;
  color: white;
  padding: 30px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.5);
  min-width: 280px;
}

.game-loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.game-loading-text {
  font-size: 16px;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.game-loading-name {
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
