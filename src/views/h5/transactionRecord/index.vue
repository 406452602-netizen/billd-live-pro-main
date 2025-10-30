<template>
  <div class="transaction-record-page">
    <!-- 页面标题 -->
    <div class="page-title">交易记录</div>

    <!-- 交易类型标签 -->
    <n-tabs
      v-model:value="activeTab"
      class="transaction-tabs"
      @update:value="switchTab"
    >
      <n-tab-pane
        name="deposit"
        tab="存款"
      ></n-tab-pane>
      <n-tab-pane
        name="withdraw"
        tab="取款"
      ></n-tab-pane>
      <n-tab-pane
        name="gameTransaction"
        tab="游戏交易"
      ></n-tab-pane>
    </n-tabs>
    <!-- 交易记录展示 -->
    <div class="transaction-results">
      <!-- 今天交易 -->
      <n-collapse
        v-model:expanded-keys="expandedKeys"
        :default-expanded-names="['today', 'history']"
        class="result-section"
      >
        <n-collapse-item
          name="today"
          :title="`今天(${todayTransactions.length})`"
        >
          <n-list
            v-if="todayTransactions.length > 0"
            class="transaction-list"
            clickable
          >
            <n-list-item
              v-for="item in todayTransactions"
              :key="item.id"
              class="transaction-item"
              @click="jumpDetail(item)"
            >
              <div class="transaction-info">
                <div class="transaction-type">
                  {{ showType(item) }}
                </div>
                <div class="transaction-time">
                  {{ formatTime(item.created_at) }}
                </div>
              </div>
              <div class="transaction-amount">
                {{ Number(item.amount) > 0 ? item.amount : -item.amount }} 元
              </div>
              <template #suffix>
                <div class="show-status">
                  <div class="show-status">
                    <n-gradient-text :type="getStatus(item.status)">
                      {{ auditStatusEnumMap[item.status] }}
                    </n-gradient-text>
                    <n-icon
                      :component="ChevronForwardSharp"
                      color="#999"
                    />
                  </div>
                  <!--                  <n-gradient-text-->
                  <!--                    v-if="activeTab != 'gameTransaction'"-->
                  <!--                    :type="getStatus(item.status)"-->
                  <!--                  >-->
                  <!--                    {{ auditStatusEnumMap[item.status] }}-->
                  <!--                  </n-gradient-text>-->
                  <!--                  <n-gradient-text v-else>-->
                  <!--                    {{ item.game_name }}-->
                  <!--                  </n-gradient-text>-->

                  <!--                  <n-icon-->
                  <!--                    :component="ChevronForwardSharp"-->
                  <!--                    color="#999"-->
                  <!--                  />-->
                </div>
              </template>
            </n-list-item>
          </n-list>
          <div
            v-else
            class="empty-state"
          >
            今天暂无交易记录
          </div>
        </n-collapse-item>

        <!-- 历史交易 -->
        <n-collapse-item
          name="history"
          :title="`历史记录(${historyTransactions.length})`"
        >
          <n-list
            v-if="historyTransactions.length > 0"
            class="transaction-list"
          >
            <n-list-item
              v-for="item in historyTransactions"
              :key="item.id"
              class="transaction-item"
              @click="jumpDetail(item)"
            >
              <div class="transaction-info">
                <div class="transaction-type">
                  {{ showType(item) }}
                </div>
                <div class="transaction-time">
                  {{ formatTime(item.created_at) }}
                </div>
              </div>
              <div class="transaction-amount">
                {{ Number(item.amount) > 0 ? item.amount : -item.amount }} 元
              </div>
              <template #suffix>
                <div class="show-status">
                  <n-gradient-text :type="getStatus(item.status)">
                    {{ auditStatusEnumMap[item.status] }}
                  </n-gradient-text>
                  <n-icon
                    :component="ChevronForwardSharp"
                    color="#999"
                  />
                </div>
              </template>
            </n-list-item>
          </n-list>
          <div
            v-else
            class="empty-state"
          >
            暂无历史交易记录
          </div>
        </n-collapse-item>
      </n-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronForwardSharp } from '@vicons/ionicons5';
import {
  NTabs,
  NTabPane,
  NCollapse,
  NCollapseItem,
  NList,
  NListItem,
} from 'naive-ui';
import { ref, computed, onMounted } from 'vue';

import { getGameTransactionList } from '@/api/game.ts';
import { getRechargeRecords, getWithdrawalRecords } from '@/api/wallet.ts';
import { auditStatusEnumMap } from '@/constant.ts';
import { auditStatusEnum } from '@/interface.ts';
import router, { mobileRouterName } from '@/router';
import { useUserStore } from '@/store/user';

// 活跃标签
const activeTab = ref('deposit');
// 展开的面板
const expandedKeys = ref(['today', 'history']);
const userStore = useUserStore();
// 交易记录数据
const transactions = ref<any>([
  // 模拟数据
  {
    id: 1,
    type: 'deposit',
    amount: 1000,
    time: new Date('2023-11-15 09:30:00'),
  },
  {
    id: 2,
    type: 'withdraw',
    amount: -500,
    time: new Date('2023-11-15 14:20:00'),
  },
  {
    id: 3,
    type: 'deposit',
    amount: 2000,
    time: new Date('2023-11-14 10:15:00'),
  },
  {
    id: 4,
    type: 'withdraw',
    amount: -800,
    time: new Date('2023-11-13 16:40:00'),
  },
]);

// 过滤今天的交易
const todayTransactions = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return transactions.value.filter((item) => {
    const itemDate = new Date(item.created_at);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate.getTime() === today.getTime();
  });
});

const jumpDetail = (item) => {
  if (activeTab.value == 'gameTransaction') {
    return;
  }
  router.push({
    name: mobileRouterName.h5TransactionRecordDetail,
    query: {
      id: item.id,
    },
  });
};

const getStatus = (status) => {
  switch (status) {
    case auditStatusEnum.APPROVED:
      return 'success';
    case auditStatusEnum.REJECTED:
      return 'error';
    case auditStatusEnum.CANCELED:
      return 'info';
    default:
      return 'primary';
  }
};

// 过滤历史交易
const historyTransactions = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return transactions.value.filter((item) => {
    const itemDate = new Date(item.created_at);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate.getTime() < today.getTime();
  });
});

const showType = (item) => {
  switch (activeTab.value) {
    case 'deposit':
      return '存款';
    case 'withdraw':
      return '取款';
    case 'gameTransaction':
      if (item.transaction_type === 1) {
        return '转入';
      } else {
        return '转出';
      }
    default:
      return '';
  }
};

const rechargeList = () => {
  getRechargeRecords({
    nowPage: 1,
    pageSize: 1000,
    is_admin_change: false,
    orderBy: 'desc',
    orderName: 'id',
  }).then((response) => {
    if (response.code === 200) {
      transactions.value = response.data.rows;
    }
  });
};

const gameTransactionList = () => {
  getGameTransactionList({
    user_id: userStore.userInfo?.id,
    nowPage: 1,
    pageSize: 1000,
    orderBy: 'desc',
    orderName: 'id',
  }).then((response) => {
    if (response.code === 200) {
      transactions.value = response.data.rows;
    }
  });
};

const withdrawalList = () => {
  getWithdrawalRecords({
    user_id: userStore.userInfo?.id,
    nowPage: 1,
    pageSize: 1000,
    orderBy: 'desc',
    orderName: 'id',
  }).then((response) => {
    if (response.code === 200) {
      transactions.value = response.data.rows;
    }
  });
};

const switchTab = (info) => {
  switch (info) {
    case 'deposit':
      rechargeList();
      break;
    case 'withdraw':
      withdrawalList();
      break;
    case 'gameTransaction':
      gameTransactionList();
      break;
    default:
      break;
  }
};

// 格式化时间
const formatTime = (time) => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(time));
};

onMounted(() => {
  switchTab(activeTab.value);
});
</script>

<style scoped>
.transaction-record-page {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
  height: 80vh;
  overflow-y: scroll;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.transaction-tabs {
  margin-bottom: 20px;
}

.show-status {
  min-width: 18vw;
  display: flex;
  align-items: center;
}

.result-section {
  margin-top: 20px;
}

.transaction-list {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.transaction-item {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-type {
  font-weight: 500;
  margin-bottom: 4px;
}

.transaction-time {
  font-size: 12px;
  color: #666;
}

.transaction-amount {
  font-weight: bold;
}

.transaction-amount[data-type='deposit'] {
  color: #00b42a;
}

.transaction-amount[data-type='withdraw'] {
  color: #f53f3f;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}
</style>
