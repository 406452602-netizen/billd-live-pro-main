<template>
  <div class="withdraw-container">
    <!-- 原有头部代码保持不变 -->
    <header class="card-header">
      <n-button
        :text="true"
        class="back-button"
        @click="goBack"
      >
        <n-icon :component="ArrowBack" />
      </n-button>
      <!-- wallet.withdraw: 提现文本（中英文切换） -->
      <div>{{ sysTranslationsDict['wallet.withdraw'] }}</div>
      <div></div>
    </header>

    <div class="content">
      <!-- 钱包区域 -->
      <div class="wallet-section">
        <div class="wallet-header">
          <div class="wallet-title">
            {{ sysTranslationsDict['wallet.central'] || '当前余额' }}
          </div>
          <n-icon class="eye-icon">
            <Eye />
          </n-icon>
        </div>
        <div class="wallet-balance">
          <div>{{ userStore.userInfo?.wallet?.balance || 0 }}</div>
          <n-button
            class="add-button"
            size="small"
            round
            quaternary
            @click="goToAddAccount"
          >
            {{ sysTranslationsDict['sys.wallet.add'] || '添加收款方式' }}
          </n-button>
        </div>
      </div>
      <!-- 顶部可切换的 Tab -->
      <n-tabs
        v-model:value="activeTab"
        type="segment"
        animated
        :theme-overrides="tabsOverrides"
      >
        <!-- wallet.card.withdrawal: 银行卡提现文本（中英文切换） -->
        <n-tab-pane
          name="1"
          :tab="sysTranslationsDict['wallet.card.withdrawal']"
        />
        <!-- wallet.virtual.withdrawal: 虚拟账户提现文本（中英文切换） -->
        <n-tab-pane
          name="2"
          :tab="sysTranslationsDict['wallet.virtual.withdrawal']"
        />
      </n-tabs>
      <n-card class="form-container">
        <div class="form-group">
          <!-- wallet.bank.card: 银行卡文本, wallet.virtual.account: 虚拟账户文本（中英文切换） -->
          <label class="label">
            {{
              activeTab === '1'
                ? sysTranslationsDict['wallet.bank.card']
                : sysTranslationsDict['wallet.virtual.account']
            }}
          </label>
          <!-- 显示银行卡/虚拟账号列表 -->
          <div
            v-for="account in activeTab === '1' ? bankCards : virtualAccounts"
            :key="account.id"
            class="account-item"
            :class="{ selected: selectedAccount === account.id }"
            @click="selectAccount(account.id)"
          >
            <div class="account-number">{{ account.card_number }}</div>
            <div class="account-name">
              {{ account.bank.bank_name }}
            </div>
          </div>
          <!-- sys.placeholder.chose: 选择提示文本（中英文切换） -->
          <!-- wallet.bank.card: 银行卡文本, wallet.virtual.account: 虚拟账户文本（中英文切换） -->
          <div
            v-if="showAccountError"
            class="error-message"
          >
            {{ sysTranslationsDict['sys.placeholder.chose'] }}
            {{
              activeTab === '1'
                ? sysTranslationsDict['wallet.bank.card']
                : sysTranslationsDict['wallet.virtual.account']
            }}
          </div>
        </div>
        <!-- 原有金额选择代码保持不变 -->
        <div class="amount-buttons">
          <!-- 取款金额选择按钮 -->
          <n-radio-group
            v-model:value="choseValue"
            size="medium"
          >
            <n-radio
              v-for="amount in presetAmounts"
              :key="amount"
              :value="amount"
              @click="selectAmount(amount)"
            >
              {{ amount }}
            </n-radio>
            <!-- sys.custom: 自定义文本（中英文切换） -->
            <n-radio
              :value="-1"
              @click="handleCustomAmountClick"
            >
              {{ sysTranslationsDict['sys.custom'] }}
            </n-radio>
          </n-radio-group>
        </div>
        <div
          v-if="showCustomAmount"
          class="form-group"
        >
          <!-- 使用 NInputNumber 替换 input 组件 -->
          <!-- sys.placeholder.input: 输入提示文本（中英文切换） -->
          <n-input-number
            id="amount"
            v-model:value="amount"
            :min="0"
            :placeholder="sysTranslationsDict['sys.placeholder.input']"
          />
        </div>
        <!-- wallet.confirm: 确认按钮文本（中英文切换） -->
        <n-button
          type="primary"
          block
          round
          :disabled="selectedAccount == 0 || !amount"
          @click="handleWithdraw"
        >
          {{ sysTranslationsDict['wallet.confirm'] }}
        </n-button>
      </n-card>
      <!-- 原有提现记录代码保持不变 -->
      <n-card class="history-container">
        <template #header>
          <!-- wallet.withdraw.record: 提现记录文本（中英文切换） -->
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span> {{ sysTranslationsDict['wallet.withdraw.record'] }}</span>
            <span style="color: #555555">{{
              sysTranslationsDict['home.view.more']
            }}</span>
          </div>
        </template>
        <!-- 使用 NDataTable 替换 table 组件 -->
        <n-data-table
          remote
          :columns="columns"
          :pagination="pagination"
          :data="withdrawalRecords"
          :theme-overrides="tableOverrides"
          @update:page="fetchWithdrawalRecords"
        />
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowBack, Eye } from '@vicons/ionicons5';
import { TabsProps, useMessage } from 'naive-ui';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  createWithdrawalRecord,
  getBankCards,
  getWithdrawalRecords,
} from '@/api/wallet.ts';
import { mobileRouterName } from '@/router';
import { useCacheStore } from '@/store/cache';
import { useUserStore } from '@/store/user';
import { usePage } from '@/utils/use-page.ts';

const userStore = useUserStore();
const router = useRouter();
const pagination = usePage();
const amount = ref(0);
const selectedAccount = ref(0);
const bankCards = ref<any[]>([]);
const virtualAccounts = ref<any[]>([]);
const withdrawalRecords = ref<any[]>([]);
const message = useMessage();
const activeTab = ref('1');
// 国际化翻译字典 - 从缓存存储中获取当前语言的翻译文本（sysTranslationsDict）
const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});

const presetAmounts = [100, 150, 200];
const choseValue = ref(0);
const showAccountError = ref(false);

const showCustomAmount = ref(false);

type TabsThemeOverrides = NonNullable<TabsProps['themeOverrides']>;
const tabsOverrides: TabsThemeOverrides = {
  tabTextColorActiveSegment: '#fff',
  colorSegment: '#fff',
  barColor: '#4d20ae',
  tabTextColorHoverSegment: '#fff',
  tabBorderColor: '#4d20ae',
  tabTextColorSegment: '#4d20ae',
  tabColorSegment: '#4d20ae',
  tabColor: '#666666',
  tabTextColorBar: '#4d20ae',
};

// 表格主题配置
const tableOverrides = {
  borderRadius: '12px',
  borderColor: '#CCCCCC',
  thBackgroundColor: 'transparent',
  thBackgroundHoverColor: 'transparent',
  thBackgroundSupplementaryColor: 'transparent',
};

function isLogin() {
  if (!userStore.userInfo?.id) {
    message.warning('请先进行登录！');
    router.push({ name: mobileRouterName.h5Login });
    return false;
  }
  return true;
}

// 新增选择账号方法
function selectAccount(id: number) {
  selectedAccount.value = id;
  showAccountError.value = false; // 选择账号后隐藏错误提示
}

const columns = [
  {
    // wallet.amount: 金额文本（中英文切换）
    title: sysTranslationsDict.value['wallet.amount'],
    key: 'amount',
  },
  {
    // wallet.bank.card: 银行卡文本, wallet.virtual.account: 虚拟账户文本（中英文切换）
    title: `${sysTranslationsDict.value['wallet.bank.card']}/${sysTranslationsDict.value['wallet.virtual.account']}`,
    key: 'bank.bank_card',
    render: (row) =>
      `${row.bankCard.bank.bank_name} - ${row.bankCard.card_number}`,
  },
  {
    // sys.review.time: 审核时间文本（中英文切换）
    title: sysTranslationsDict.value['sys.review.time'],
    key: 'reviewed_at',
    render: (row) => {
      return row.reviewed_at
        ? row.reviewed_at
        : // sys.unreviewed: 未审核文本（中英文切换）
          sysTranslationsDict.value['sys.unreviewed'];
    },
  },
];
onMounted(async () => {
  await fetchBankCards();
  await fetchWithdrawalRecords(1);
});

// 添加自定义金额选择处理
function handleCustomAmountClick() {
  showCustomAmount.value = true;
  if (selectedAccount.value === 0) {
    showAccountError.value = true;
  } else {
    showAccountError.value = false;
  }
}

async function fetchBankCards() {
  try {
    const res = await getBankCards({
      user_id: userStore.userInfo?.id,
      nowPage: 1,
      pageSize: 1000,
      orderBy: 'desc',
      orderName: 'id',
      bank_type: 1,
    });
    if (res.code === 200) {
      bankCards.value = res.data.rows;
    }
    const res2 = await getBankCards({
      user_id: userStore.userInfo?.id,
      nowPage: 1,
      pageSize: 1000,
      orderBy: 'desc',
      orderName: 'id',
      bank_type: 2,
    });
    if (res2.code === 200) {
      virtualAccounts.value = res2.data.rows;
    }
  } catch (error) {
    console.error('获取银行卡失败', error);
  }
}

async function fetchWithdrawalRecords(currentPage) {
  try {
    const res = await getWithdrawalRecords({
      user_id: userStore.userInfo?.id,
      pageSize: pagination.pageSize,
      nowPage: currentPage,
      orderBy: 'desc',
      orderName: 'id',
    });
    if (res.code === 200) {
      withdrawalRecords.value = res.data.rows;
      pagination.itemCount = res.data.total;
    }
  } catch (error) {
    console.error('获取提现记录失败', error);
  }
}

async function handleWithdraw() {
  if (isLogin()) {
    if (amount.value <= 0 || !selectedAccount.value) {
      message.warning('请输入有效金额并选择账号');
      return;
    }
    try {
      const res = await createWithdrawalRecord({
        user_id: userStore.userInfo?.id,
        bank_card_id: selectedAccount.value,
        amount: amount.value,
      });
      if (res.code === 200) {
        message.success('提现请求已提交，等待审核');
        amount.value = 0;
        await fetchWithdrawalRecords(pagination.page);
        await userStore.getUserInfo();
      }
    } catch (error) {
      console.error('提现失败', error);
      message.error('提现失败，请重试');
    }
  }
}

function goToAddAccount() {
  if (isLogin()) {
    router.push({
      name: mobileRouterName.h5AddBankCard,
      query: {
        bankType: activeTab.value,
      },
    });
  }
}

function goBack() {
  router.go(-1);
}

function selectAmount(amountValue: number) {
  amount.value = amountValue;
  showCustomAmount.value = false;
  if (selectedAccount.value === 0) {
    showAccountError.value = true;
  }
}

watch(
  () => pagination.pageSize,
  () => {
    fetchWithdrawalRecords(1);
  }
);
</script>

<style scoped lang="scss">
.wallet-section {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #722ed1 0%, #9945ff 100%);
  border-radius: 12px;
  color: white;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.wallet-title {
  font-size: 16px;
  font-weight: 500;
}

.wallet-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wallet-balance div {
  font-size: 28px;
  font-weight: bold;
}

.add-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.error-message {
  color: #f53f3f;
  font-size: 12px;
  margin-top: 5px;
  height: 18px; // 固定高度避免布局跳动
  line-height: 18px;
}

.withdraw-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-container {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  height: 50px;
  padding-top: env(safe-area-inset-top, 0);
  position: relative;
  text-align: center;
}

.amount-buttons {
  display: block;
  //gap: 10px;
  //margin-bottom: 15px;
  //flex-wrap: wrap;
  margin-bottom: 10px;
}

.account-item {
  padding: 15px;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f7fa;
  }

  &.selected {
    background-color: #f2e8ff;
    border-color: #9945ff;
  }
}

.account-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.account-number {
  font-size: 14px;
  color: #666;
}

.history-container {
  margin-bottom: 40px;
}

.back-button {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  z-index: 10;
}

.back-button:active {
  opacity: 0.7;
}

.content {
  padding: 20px 20px;
  background: #efeff1;
  flex: 1;
}
</style>
