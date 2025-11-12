<template>
  <div class="h5-integration-game-wrap">
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
    <!-- 页面头部 -->
    <div class="header">
      <n-button
        text
        style="
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
        "
        @click="goBack"
      >
        <n-icon>
          <ChevronBack />
        </n-icon>
      </n-button>
      <h1 class="page-title">
        {{ currentLocale === 'zh' ? '集成游戏' : 'Integration Games' }}
      </h1>
    </div>

    <!-- 游戏内容区域 -->
    <div class="game-content-section">
      <div
        v-if="loading"
        class="loading-state"
      >
        <div>{{ currentLocale === 'zh' ? '加载中...' : 'Loading...' }}</div>
      </div>
      <div
        v-else-if="error"
        class="error-state"
      >
        <div>{{ error }}</div>
        <n-button @click="loadIntegrationGames()"
          >{{ currentLocale === 'zh' ? '重试' : 'Retry' }}
        </n-button>
      </div>
      <div
        v-else-if="games.length === 0"
        class="empty-state"
      >
        <div>
          {{ currentLocale === 'zh' ? '暂无游戏数据' : 'No games available' }}
        </div>
      </div>
      <div
        v-else
        class="game-grid"
      >
        <div
          v-for="game in games"
          :key="game.gameID"
          class="game-card"
          @click="enterGame(game)"
        >
          <div class="game-image">
            <img
              :src="game.imageUrl || game.imageUrl_H"
              :alt="getLocalizedGameName(game)"
              class="game-pic"
            />
          </div>
          <div class="game-details">
            <h3 class="game-title">{{ getLocalizedGameName(game) }}</h3>
            <p class="game-id">ID: {{ game.gameID }}</p>
            <n-button
              type="primary"
              class="enter-btn"
            >
              {{ currentLocale === 'zh' ? '进入游戏' : 'Play Now' }}
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
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
</template>

<script lang="ts" setup>
import { ChevronBack } from '@vicons/ionicons5';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getGameBetLobby, getGameIntegrations } from '@/api/game';
import { fetchUserKeepAlive } from '@/api/user';
import router from '@/router';
import { useCacheStore } from '@/store/cache';
import { useUserStore } from '@/store/user';

const route = useRoute();
const userStore = useUserStore();
const cacheStore = useCacheStore();
const loading = ref(false);
const error = ref('');
const games = ref<any[]>([]);
const gameLoading = ref(false);
const currentGame = ref<any>(null);
const integrationGameId = ref<string | number>();
const showGameButton = ref(false);
const gameUrl = ref('');

// 心跳检测相关变量
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
const HEARTBEAT_INTERVAL = 30000; // 30秒心跳间隔

// 计算当前语言
const currentLocale = computed(() => {
  return cacheStore.locale || 'en';
});

const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});
// 获取游戏的本地化名称
const getLocalizedGameName = (game: any) => {
  if (!game.gameNameMappings || !game.gameNameMappings.length) {
    return game.gameName || game.game_name || `游戏 ${game.gameID}`;
  }

  // 根据当前语言查找对应的名称
  const mapping = game.gameNameMappings.find((item: any) =>
    item.languageCode.includes(currentLocale.value)
  );

  return mapping
    ? mapping.text
    : game.gameName || game.game_name || `游戏 ${game.gameID}`;
};

// 加载集成游戏列表
const loadIntegrationGames = async () => {
  if (!integrationGameId.value) {
    error.value =
      currentLocale.value === 'zh' ? '游戏ID无效' : 'Invalid game ID';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // 调用新的API获取集成游戏列表
    const response = await getGameIntegrations(integrationGameId.value);

    if (response.code === 200 && response.data) {
      // 根据实际API返回的数据结构进行处理
      // 假设API返回的是游戏数组
      games.value = response.data || [];
    } else {
      error.value =
        currentLocale.value === 'zh'
          ? '获取游戏数据失败'
          : 'Failed to get game data';
    }
  } catch (err) {
    console.error('加载集成游戏列表失败:', err);
    error.value =
      currentLocale.value === 'zh'
        ? '加载游戏数据异常'
        : 'Error loading game data';
  } finally {
    loading.value = false;
  }
};

// 启动心跳检测
const startKeepAlive = () => {
  // 清除现有定时器
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
  }

  // 设置定时器定期执行心跳
  keepAliveTimer = setInterval(() => {
    fetchUserKeepAlive();
  }, HEARTBEAT_INTERVAL);
};

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

// 停止心跳检测
const stopKeepAlive = () => {
  console.log('stopKeepAlive 停止心跳检测');
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
};

// 页面失去焦点时处理
const handlePageBlur = () => {
  // 页面失去焦点时不停止心跳，确保游戏信息实时获取
};

// 页面获得焦点时处理
const handlePageFocus = () => {
  // 页面获得焦点时如果心跳已停止，则重新启动
  if (!keepAliveTimer && currentGame.value) {
    startKeepAlive();
  }
};

// 进入游戏
const enterGame = (game: any) => {
  if (!game || !game.gameID) {
    window.$message.error(
      currentLocale.value === 'zh' ? '游戏信息无效' : 'Invalid game information'
    );
    return;
  }

  gameLoading.value = true;
  currentGame.value = game;

  // 调用游戏大厅接口，传入两个参数
  // gameId: 平台中的标识id
  // id: 游戏旗下游戏列表的id
  getGameBetLobby({
    gameId: integrationGameId.value,
    id: game.gameID,
  })
    .then((res: any) => {
      gameLoading.value = false;
      currentGame.value = null;

      if (res && res.code === 200 && res.data) {
        userStore.getUserInfo();
        // 存储游戏URL以便在需要时使用
        gameUrl.value = res.data;
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
          }
        } catch (error) {
          console.error('打开新窗口失败:', error);
          showGameButton.value = true;
        }
        // 启动心跳检测
        startKeepAlive();
      } else {
        console.error('获取游戏大厅连接失败', res);
        window.$message.error(
          currentLocale.value === 'zh'
            ? '获取游戏大厅连接失败'
            : 'Failed to get game lobby connection'
        );
      }
    })
    .catch((error) => {
      setTimeout(() => {
        gameLoading.value = false;
        currentGame.value = null;
        // 停止心跳检测
        stopKeepAlive();

        console.error('获取游戏大厅连接异常', error);
        window.$message.error(
          currentLocale.value === 'zh'
            ? '获取游戏大厅连接异常'
            : 'Error connecting to game lobby'
        );
      }, 1000);
    });
};

// 返回上一页
const goBack = () => {
  // 返回时停止心跳检测
  stopKeepAlive();
  router.back();
};

// 页面加载时获取数据
onMounted(() => {
  integrationGameId.value = Number(route.params.gameId);
  loadIntegrationGames();

  // 添加页面焦点事件监听
  window.addEventListener('blur', handlePageBlur);
  window.addEventListener('focus', handlePageFocus);
});

// 页面卸载时清理
onUnmounted(() => {
  // 停止心跳检测
  stopKeepAlive();

  // 移除页面焦点事件监听
  window.removeEventListener('blur', handlePageBlur);
  window.removeEventListener('focus', handlePageFocus);
});
</script>

<style lang="scss" scoped>
$theme-primary: #ff6b35;
$theme-secondary: #4a6fa5;
$theme-background: #f2f1f6;
$theme-card: #ffffff;
$theme-text-primary: #333333;
$theme-text-secondary: #666666;
$theme-border: #eaeaea;

.h5-integration-game-wrap {
  background-color: $theme-background;
  min-height: 100vh;
  padding-top: 60px;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: $theme-text-primary;
}

.game-content-section {
  padding: 20px 16px;
  margin: 16px;
  background-color: #fff;
  border-radius: 10px;
}

.loading-state,
.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #999;
}

.error-state {
  color: #ff4d4f;
}

// 游戏网格布局
.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.game-card {
  background: $theme-card;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  border: 1px solid $theme-border;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
}

.game-image {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.game-pic {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #ffffff;
}

.game-type-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  backdrop-filter: blur(2px);
}

.game-details {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.game-title {
  font-size: 14px;
  font-weight: 600;
  color: $theme-text-primary;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.game-id {
  font-size: 12px;
  color: $theme-text-secondary;
  margin: 0 0 12px 0;
}

.enter-btn {
  margin-top: auto;
  height: 40px;
  font-size: 14px;
  border-radius: 8px;
}

// 适配不同屏幕尺寸
@media (min-width: 768px) {
  .h5-integration-game-wrap {
    max-width: 800px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .h5-integration-game-wrap {
    max-width: 1000px;
  }

  .game-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .game-image {
    height: 140px;
  }
}

/* 游戏加载层样式 */
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
