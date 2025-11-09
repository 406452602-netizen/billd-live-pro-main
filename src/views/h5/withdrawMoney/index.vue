<template>
  <div class="withdraw-container">
    <!-- 原有头部代码保持不变 -->
    <n-card :bordered="false">
      <template #header>
        <div class="card-header">
          <n-button
            :text="true"
            @click="goBack"
          >
            <n-icon :component="ArrowBack" />
          </n-button>
          <!-- wallet.withdraw: 提现文本（中英文切换） -->
          <div>{{ sysTranslationsDict['wallet.withdraw'] }}</div>
          <!-- 显示钱包余额 -->
          <!-- wallet.balance: 钱包余额文本（中英文切换） -->
          <div>
            {{ sysTranslationsDict['wallet.balance'] }}:
            {{ userStore.userInfo?.wallet?.balance || 0 }} 元
          </div>
          <!-- 添加按钮 -->
          <!-- sys.wallet.add: 添加钱包文本（中英文切换） -->
          <n-button
            type="primary"
            size="small"
            @click="goToAddAccount"
          >
            {{ sysTranslationsDict['sys.wallet.add'] }}
          </n-button>
        </div>
      </template>
    </n-card>
    <!-- 顶部可切换的 Tab -->
    <n-tabs
      v-model:value="activeTab"
      type="line"
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
          <div class="account-name">
            {{ account.bank.bank_name }}
          </div>
          <div class="account-number">{{ account.card_number }}</div>
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
          <n-radio-button
            v-for="amount in presetAmounts"
            :key="amount"
            :value="amount"
            @click="selectAmount(amount)"
          >
            {{ amount }}
          </n-radio-button>
          <!-- sys.custom: 自定义文本（中英文切换） -->
          <n-radio-button
            :value="-1"
            @click="handleCustomAmountClick"
          >
            {{ sysTranslationsDict['sys.custom'] }}
          </n-radio-button>
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
        <div>{{ sysTranslationsDict['wallet.withdraw.record'] }}</div>
      </template>
      <!-- 使用 NDataTable 替换 table 组件 -->
      <n-data-table
        remote
        :columns="columns"
        :pagination="pagination"
        :data="withdrawalRecords"
        @update:page="fetchWithdrawalRecords"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ArrowBack } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';

import {
  getBankCards,
  createWithdrawalRecord,
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
.error-message {
  color: #f53f3f;
  font-size: 12px;
  margin-top: 5px;
  height: 18px; // 固定高度避免布局跳动
  line-height: 18px;
}

.withdraw-container {
  padding: 20px;
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
  justify-content: space-between;
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
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f7fa;
  }

  &.selected {
    background-color: #e6f7ff;
    border-color: #91d5ff;
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
</style>
