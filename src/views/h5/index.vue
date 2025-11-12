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
    <div style="padding: 0 15px; margin-bottom: 15px">
      <n-carousel
        direction="horizontal"
        autoplay
        dot-type="line"
        dot-placement="bottom"
        style="
          height: 180px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        "
      >
        <img
          v-for="(item, index) in adList"
          :key="index"
          class="carousel-img"
          :src="AXIOS_BASEURL + item.ad_image"
          @click="goUrl(item)"
        />
      </n-carousel>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-info-card">
      <div class="user-info-container">
        <!-- 左侧：用户名和钱包 -->
        <div class="user-left-section">
          <div
            class="user-name"
            @click="handleLoginClick"
          >
            <span class="user-name-label"></span>
            {{
              userStore.userInfo
                ? userStore.userInfo.username
                : sysTranslationsDict['sys.login']
            }}
          </div>
          <div
            v-if="userStore.userInfo"
            class="user-balance"
          >
            <img
              src="@/assets/img/coin.png"
              alt="余额图标"
            />
            <span>{{ userStore.userInfo.wallet?.balance || '0.00' }}</span>
          </div>
        </div>

        <!-- 右侧：快捷操作按钮 -->
        <div class="user-right-section">
          <div
            class="action-btn"
            @click="jumpPage(mobileRouterName.h5DepositMoney)"
          >
            <div class="action-icon">
              <img
                src="@/assets/img/home/depositMoney.png"
                class="user-menu"
                alt="depositMoney"
              />
            </div>
            <div class="action-text">
              <!-- 存款 -->
              {{ sysTranslationsDict['sys.deposit.money'] }}
            </div>
          </div>
          <div
            class="action-btn"
            @click="jumpPage(mobileRouterName.h5WithdrawMoney)"
          >
            <div class="action-icon">
              <img
                src="@/assets/img/home/withdrawMoney.png"
                class="user-menu"
                alt="withdrawMoney"
              />
            </div>
            <div class="action-text">
              <!-- 取款 -->
              {{ sysTranslationsDict['sys.withdraw.money'] }}
            </div>
          </div>
          <div
            class="action-btn"
            @click="jumpPage(mobileRouterName.h5GameBalance)"
          >
            <div class="action-icon">
              <img
                src="@/assets/img/home/convert.png"
                class="user-menu"
                alt="convert"
              />
            </div>
            <div class="action-text">
              <!-- 转换 -->
              {{ sysTranslationsDict['sys.convert'] }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--本地竞猜界面-->
    <router-link :to="{ name: mobileRouterName.h5CompetitionList }">
      <img
        src="@/assets/img/mask_group.png"
        style="width: 90vw; margin: auto 5vw auto 5vw; border-radius: 8px"
      />
    </router-link>
    <!-- 移除了多余的图片引用，避免影响布局 -->
    <!-- 游戏列表展示区域 -->
    <div class="game-list-section">
      <div class="game-list-title">
        <!-- sys.game.list: 游戏列表文本（中英文切换） -->
        <h3>
          <span class="title-decoration"></span>
          {{ sysTranslationsDict['sys.game.list'] }}
        </h3>
      </div>

      <div
        v-if="loadingGames"
        class="empty-state"
      >
        <div>加载中...</div>
      </div>

      <div
        v-else-if="gameList.length === 0"
        class="empty-state"
      >
        <div>暂无游戏数据</div>
      </div>

      <div
        v-else
        class="game-grid"
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
        >
          <div class="game-logo">
            <img
              v-if="game.icon"
              :src="game.icon"
              :alt="game.game_name"
              class="game-icon-img"
            />
            <div
              v-else
              class="game-icon-placeholder"
            >
              {{ game.game_name?.charAt(0) || '游' }}
            </div>
          </div>
          <div class="game-name">
            {{ game.game_name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import { openToTarget } from 'billd-utils';
import { computed, onMounted, onUnmounted, ref } from 'vue';
// import { useI18n } from 'vue-i18n';

// import { fetchAreaLiveRoomList } from '@/api/area';
// import { fetchLiveBilibiliGetUserRecommend } from '@/api/bilibili';
import { adCarouselList } from '@/api/ad.ts';
import { getGameBetLobby, getGamesNames } from '@/api/game.ts';
import { fetchUserKeepAlive } from '@/api/user';
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
// import {
//   IArea,
//   // ILive,
//   // SwitchEnum
// } from '@/interface';
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

function handleLoginClick() {
  if (!userStore.userInfo) {
    // 游客状态下点击显示登录弹窗
    router.push({
      name: mobileRouterName.h5Login,
    });
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
.user-menu {
  height: 36px;
  width: 36px;
}

.h5-wrap {
  background: linear-gradient(to bottom, #eee7f7 0%, #ffffff 100%);
  min-height: 100vh;
  padding-bottom: 70px; // 为底部导航栏留出空间
  padding-top: 0;
}

/* 用户信息卡片样式 */
.user-info-card {
  padding: 15px;
  margin: 0 15px 15px;
  border-radius: 12px;
  //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-info-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

/* 左侧部分：用户名和钱包 */
.user-left-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #7a57d1;
  font-size: 18px;
  letter-spacing: 0.5px;
}

.user-name-label {
  background: #7a57d1;
  width: 4px;
  height: 18px;
  border-radius: 2px;
  margin-right: 10px;
  display: inline-block;
  vertical-align: middle;
}

.user-balance {
  display: flex;
  align-items: center;
  margin-top: 8px;
  color: #ff6b6b;
  font-weight: 600;
  font-size: 18px;
}

.user-balance img {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.user-balance span {
  font-weight: bold;
  margin-left: 4px;
  color: #ff6b6b;
}

/* 右侧部分：快捷操作按钮 */
.user-right-section {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.95);
}

.action-icon {
  font-size: 22px;
  margin-bottom: 4px;
}

.action-text {
  font-size: 12px;
  color: #000;
  font-weight: 600;
}

/* 标题样式 - 紫色 */
.game-list-title {
  padding: 0 15px;
  margin-bottom: 15px;
  margin-top: 20px;
}

.game-list-title h3 {
  margin: 0;
  font-size: 18px;
  color: #7a57d1; /* 紫色标题 */
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.title-decoration {
  background: #7a57d1;
  width: 4px;
  height: 18px;
  border-radius: 2px;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 游戏网格布局 - 统一样式 */
.game-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 0 15px;
  margin-bottom: 20px;
}

.game-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin: 0;
  cursor: pointer;
  width: 100%;
  text-align: center;
  transition: all 0.3s;
}

.game-item:active {
  transform: scale(0.95);
}

.game-logo {
  margin-bottom: 8px;
  width: 100px;
  height: 100px;
  display: flex;
  padding: 5px;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

/* 游戏图标样式 */
.game-icon-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  aspect-ratio: 1;
  transition: transform 0.2s ease;
}

.game-item:active .game-icon-img {
  transform: scale(0.98);
}

.game-name {
  font-size: 14px;
  text-align: center;
  color: #333;
  margin-top: 10px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  font-weight: 500;
}

.game-icon-placeholder {
  width: 100%;
  aspect-ratio: 1;
  background-color: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 游戏列表区域样式 */
.game-list-section {
  margin: 0 0 30px;
}

/* 轮播图样式 */
.carousel-img {
  height: 180px;
  width: 100%;
  display: block;
  margin: 0 auto;
  object-fit: cover;
}

/* 游戏网格布局 - 与设计图一致 */
/* 已在上方统一定义游戏网格样式 */

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
