<template>
  <div class="h5-game-balance-wrap">
    <!-- 页面头部 -->
    <div class="header">
      <n-button
        text
        @click="goBack"
        style="
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
        "
      >
        <n-icon>
          <ArrowBack />
        </n-icon>
      </n-button>
      <h1 class="page-title">游戏余额</h1>
    </div>

    <!-- 钱包信息 -->
    <div class="wallet-section">
      <div class="wallet-header">
        <span class="wallet-title">中心钱包</span>
        <n-icon
          @click="refreshWallet"
          class="refresh-icon"
        >
          <Refresh />
        </n-icon>
      </div>
      <div class="wallet-amount">
        $ {{ userStore.userInfo?.wallet?.balance || 0 }}
      </div>
      <n-button
        type="primary"
        class="withdraw-btn"
        @click="handleWithdrawAll"
        :loading="withdrawing"
      >
        一键提取
      </n-button>
    </div>

    <!-- 游戏余额列表 -->
    <div class="game-list-section">
      <h2 class="section-title">游戏余额</h2>
      <div class="game-cards-grid">
        <n-card
          v-for="(game, index) in gameBalanceList"
          :key="game.game_id"
          class="game-card"
        >
          <template #header>
            <div class="game-card-header">
              <n-icon
                :size="20"
                v-if="game.icon"
              >
                <img :src="game.icon" />
              </n-icon>
              <span class="game-name">{{ game.game_name }}</span>
            </div>
          </template>
          <div class="game-balance">
            <span class="balance-amount">$ {{ game.balance || 0 }}</span>
            <n-button
              text
              size="small"
              class="withdraw-item-btn"
              @click="handleWithdrawGame(game.game_id, game.balance, index)"
            >
              提取
            </n-button>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowBack, Refresh } from '@vicons/ionicons5';
import { onMounted, ref } from 'vue';

import {
  getGames,
  withdrawGameBalance,
  withdrawGameBalanceAll,
} from '@/api/game';
import router from '@/router';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const gameBalanceList = ref<any[]>([]);
const loading = ref(false);
const withdrawing = ref(false);

// 获取游戏余额列表
const fetchGameBalanceList = async () => {
  loading.value = true;
  try {
    // 调用API获取游戏列表
    const response = await getGames();
    if (response.code === 200 && response.data && response.data.rows) {
      // 解析返回结构，提取游戏信息和余额
      gameBalanceList.value = response.data.rows.map((game) => ({
        game_id: game?.game_id || 0,
        game_name: game?.game_name || '未知游戏',
        balance: game.config?.balance || 0,
        // 清理icon字段中的额外引号和空格
        icon: game?.icon ? game.icon.trim().replace(/^['"]|['"]$/g, '') : '',
      }));
    } else {
      window.$message.error('获取游戏列表失败');
      gameBalanceList.value = [];
    }
  } catch (error) {
    window.$message.error('获取游戏余额失败');
    gameBalanceList.value = [];
  } finally {
    loading.value = false;
  }
};

// 刷新钱包
const refreshWallet = async () => {
  try {
    await userStore.getUserInfo();
    window.$message.success('钱包刷新成功');
  } catch (error) {
    window.$message.error('钱包刷新失败');
  }
};

// 一键提取
const handleWithdrawAll = async () => {
  withdrawing.value = true;
  try {
    // 调用API实现一键提取
    const response = await withdrawGameBalanceAll();
    if (response.code === 200) {
      window.$message.success('一键提取成功');
      // 刷新数据
      await refreshWallet();
      await fetchGameBalanceList();
    } else {
      window.$message.error('提取失败');
    }
  } catch (error) {
    window.$message.error('提取失败');
  } finally {
    withdrawing.value = false;
  }
};

// 提取单个游戏余额
const handleWithdrawGame = async (gameId, amount, index) => {
  try {
    // 实际项目中应调用API
    // 这里简化处理
    const response = await withdrawGameBalance({ gameId, amount });
    if (response.code === 200) {
      gameBalanceList.value[index].balance = 0;
    }
    // 更新中心钱包（模拟）
    await refreshWallet();
    window.$message.success('提取成功');
  } catch (error) {
    window.$message.error('提取失败');
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 页面加载时获取数据
onMounted(() => {
  fetchGameBalanceList();
});
</script>

<style lang="scss" scoped>
.h5-game-balance-wrap {
  background-color: #f2f1f6;
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
}

.wallet-section {
  background-color: #fff;
  padding: 20px 16px;
  margin-bottom: 16px;
  border-radius: 10px;
  margin: 16px;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.wallet-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.refresh-icon {
  cursor: pointer;
  color: #666;
  transition: color 0.3s;

  &:hover {
    color: #1890ff;
  }
}

.wallet-amount {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 16px;
}

.withdraw-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.game-list-section {
  padding: 0 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #999;
}

.game-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.game-card {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(135deg, #f6f8fa, #e9ecef);
}

.game-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.game-card-header img {
  width: 2em;
  height: 2em;
  object-fit: contain;
  display: block;
}

.game-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.game-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.balance-amount {
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
}

.withdraw-item-btn {
  color: #1890ff;
  font-size: 12px;
}

// 适配不同屏幕尺寸
@media (min-width: 768px) {
  .h5-game-balance-wrap {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>
