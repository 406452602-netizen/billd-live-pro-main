<template>
  <div class="bet-history-page">
    <div class="header">
      <n-button
        size="small"
        @click="router.go(-1)"
      >
        <n-icon>
          <ChevronBackOutline />
        </n-icon>
      </n-button>
      <h2 class="page-title">投注历史</h2>
    </div>

    <!-- 时间查询条件 -->
    <div
      class="query-condition"
      style="
        margin: 15px 0;
        padding: 15px;
        background: white;
        border-radius: 8px;
      "
    >
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        "
      >
        <n-date-picker
          v-model:value="dateRange"
          type="daterange"
          clearable
          style="width: 240px; margin-bottom: 10px"
          @update:value="handleDateRangeChange"
        />
        <n-button
          type="primary"
          size="small"
          @click="fetchAllData"
          >查询
        </n-button>
      </div>
    </div>
    <n-tabs>
      <n-tab-pane
        name="本地投注"
        tab="本地投注"
      >
        <!-- 本地投注记录 -->
        <div class="bet-section">
          <h3 class="section-title">本地投注</h3>
          <LocalBetHistory
            ref="localBetRef"
            :dateRange="dateRange"
            @update:dateRange="handleDateRangeChange"
          />
        </div>
      </n-tab-pane>
      <n-tab-pane
        name="非本地投注"
        tab="非本地投注"
      >
        <!-- 非本地投注记录 -->
        <div class="bet-section">
          <h3 class="section-title">非本地投注</h3>
          <NonLocalBetHistory
            ref="nonLocalBetRef"
            :dateRange="dateRange"
            @update:dateRange="handleDateRangeChange"
          />
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ChevronBackOutline } from '@vicons/ionicons5';
import { onMounted, ref } from 'vue';

import router from '@/router';
import { useUserStore } from '@/store/user';

// 导入子组件
import LocalBetHistory from './components/LocalBetHistory.vue';
import NonLocalBetHistory from './components/NonLocalBetHistory.vue';

const userStore = useUserStore();

// 时间范围选择器
const dateRange = ref();

// 组件引用
const localBetRef = ref();
const nonLocalBetRef = ref();

// 处理日期范围变化
const handleDateRangeChange = (value) => {
  dateRange.value = value;
};

// 获取所有数据
const fetchAllData = () => {
  // 调用子组件的方法获取数据
  try {
    if (
      localBetRef.value &&
      typeof localBetRef.value.fetchAllLocalData === 'function'
    ) {
      localBetRef.value.fetchAllLocalData();
    }
    if (
      nonLocalBetRef.value &&
      typeof nonLocalBetRef.value.fetchAllNonLocalData === 'function'
    ) {
      nonLocalBetRef.value.fetchAllNonLocalData();
    }
  } catch (error) {
    console.error('获取投注数据失败:', error);
  }
};

onMounted(() => {
  // 组件已在各自的onMounted中处理了数据获取
  // 这里只需要确保用户登录状态
  if (!userStore.userInfo) {
    userStore.getUserInfo();
  }
});
</script>

<style lang="scss" scoped>
.bet-history-page {
  padding: 20px;
  background: #f8f8f8;
  height: 90vh;
  overflow-y: scroll;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 0 20px;
  font-size: 24px;
}

/* 查询条件样式调整 */
.query-condition {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.bet-section {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}
</style>
