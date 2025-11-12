<template>
  <div class="h5-profile-wrap">
    <!-- 头部背景图片区域 -->
    <div class="header-bg">
      <!-- 右上角图标 -->
      <div class="header-icons">
        <n-icon
          class="icon"
          @click="handleMessageClick"
        >
          <ChatbubbleEllipsesOutline />
        </n-icon>
        <n-icon
          class="icon"
          @click="handleSettingClick"
        >
          <SettingsOutline />
        </n-icon>
      </div>

      <!-- 用户信息区域 -->
      <div class="user-info">
        <n-avatar
          round
          size="large"
          src="https://07akioni.oss-cn-beijing.aliyuncs.com/user_avatar.png"
          class="user-avatar"
        />
        <div
          v-if="userStore.userInfo"
          class="user-details"
        >
          <div class="username">{{ userStore.userInfo.username }}</div>
          <div class="join-info">{{ getJoinDaysText }}</div>
        </div>
        <div
          v-else
          class="login-area"
        >
          <n-button
            type="primary"
            class="login-button"
            @click="handleLoginClick"
          >
            {{ sysTranslationsDict['sys.login'] }}/{{
              sysTranslationsDict['sys.register']
            }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- 钱包区域 -->
    <div class="wallet-section">
      <div class="wallet-header">
        <span class="wallet-title">{{
          sysTranslationsDict['wallet.central']
        }}</span>
        <n-icon class="eye-icon">
          <Eye />
        </n-icon>
      </div>
      <div
        v-if="userStore.userInfo"
        class="wallet-balance"
      >
        {{ userStore.userInfo.wallet?.balance }}
        <n-icon
          class="refresh-icon"
          @click="refresh"
        >
          <Refresh />
        </n-icon>
      </div>
    </div>
    <div class="wallet-actions">
      <div
        class="action-item transaction"
        @click="handleTransactionClick"
      >
        <span class="action-text">{{
          sysTranslationsDict['my.transaction.record']
        }}</span>
        <n-icon class="arrow-icon">
          <ChevronForwardOutline />
        </n-icon>
      </div>
      <div
        class="action-item bet"
        @click="handleBetClick"
      >
        <span class="action-text">{{
          sysTranslationsDict['my.bet.record']
        }}</span>
        <n-icon class="arrow-icon">
          <ChevronForwardOutline />
        </n-icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ChatbubbleEllipsesOutline,
  Eye,
  Refresh,
  SettingsOutline,
  ChevronForwardOutline,
} from '@vicons/ionicons5';
import { computed, onMounted } from 'vue';

import router, { mobileRouterName, routerName } from '@/router';
import { useCacheStore } from '@/store/cache';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const cacheStore = useCacheStore();

const sysTranslationsDict = computed(() => {
  return cacheStore.sysTranslationsDict;
});

// 计算加入天数
const getJoinDays = computed(() => {
  if (userStore.userInfo && userStore.userInfo.created_at) {
    const createdAt = new Date(userStore.userInfo.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 796;
});

// 获取加入天数文本
const getJoinDaysText = computed(() => {
  const template =
    sysTranslationsDict.value['common.join.kaiyun.sports.day'] ||
    '加入开云体育第{days}天';
  return template.replace('{days}', getJoinDays.value.toString());
});

// 事件处理函数
const handleMessageClick = () => {
  router.push({ name: mobileRouterName.h5Message });
};

const handleSettingClick = () => {
  router.push({ name: mobileRouterName.h5Setting });
};

const handleLoginClick = () => {
  router.push({ name: mobileRouterName.h5Login });
};

const handleTransactionClick = () => {
  router.push({ name: routerName.h5TransactionRecord });
};

const handleBetClick = () => {
  router.push({ name: routerName.h5Votes });
};

const refresh = () => {
  userStore.getUserInfo();
};

onMounted(() => {
  if (!userStore.userInfo) {
    router.push({ name: mobileRouterName.h5Login });
  }
});
</script>

<style scoped>
.h5-profile-wrap {
  min-height: 100vh;
  width: 100vw;
  background-color: #f2f1f6;
  position: relative;
  padding-bottom: 60px;
}

.header-bg {
  background-image: url('@/assets/img/me_background.png');
  background-position: center;
  background-size: 100% 100%;
  padding: 20px 15px 60px;
  min-height: 20vh;
  position: relative;
}

.header-icons {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 15px;
}

.header-icons .icon {
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.user-avatar {
  background-color: white;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 60px;
  height: 60px;
}

.user-details {
  color: white;
}

.username {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.join-info {
  font-size: 14px;
  opacity: 0.9;
}

.login-button {
  background-color: rgba(255, 255, 255, 0.9);
  color: #7a57d1;
  border: none;
}

.wallet-section {
  position: relative;
  top: -10vh;
  margin: auto 20px 0;
  border-radius: 15px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 2;
  background: url('@/assets/img/me_wallet.png');
  background-size: 100% 100%;
}

.wallet-actions {
  display: flex;
  position: relative;
  top: -8vh;
  margin: 0 20px;
  gap: 10px;
  background: white;
  padding: 15px;
  border-radius: 8px;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.wallet-title {
  font-size: 16px;
  color: white;
}

.eye-icon {
  color: #c9ccd9;
  font-size: 16px;
}

.wallet-balance {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.refresh-icon {
  color: #c9ccd9;
  font-size: 16px;
  cursor: pointer;
}

.action-item {
  flex: 1;
  padding: 0 15px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  height: 80px;
}

.action-item.transaction {
  background: linear-gradient(to bottom right, #ffecd9, #ffd0bc);
}

.action-item.bet {
  background: linear-gradient(to bottom right, #d5f3ff, #5cd8ff);
}

.action-text {
  font-size: 16px;
  font-weight: 600;
  position: relative;
  top: -10px;
}

.action-item.transaction .action-text {
  color: #ff7043;
}

.action-item.bet .action-text {
  color: #2196f3;
}

.arrow-icon {
  font-size: 14px;
  position: relative;
  top: 20px;
  padding: 5px;
  border-radius: 50%;
}

.action-item.transaction .arrow-icon {
  color: #ff7043;
  background: #ffc397;
}

.action-item.bet .arrow-icon {
  color: #2196f3;
  background: #58ceef;
}
</style>
