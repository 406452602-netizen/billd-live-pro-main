<template>
  <n-card>
    <div class="form-group">
      <label
        class="label"
        for="amount"
        >{{ sysTranslationsDict['wallet.pay.method'] }}</label
      >
      <!-- 使用 NInputNumber 替换 input 组件 -->
      <n-radio-group
        v-model:value="formData.bank_type"
        size="medium"
        :on-update:value="changeBankType"
      >
        <n-radio-button
          :key="bankTypeEnum.BANK"
          :value="bankTypeEnum.BANK"
        >
          {{ sysTranslationsDict['wallet.rapid.card'] }}
        </n-radio-button>
        <n-radio-button
          :key="bankTypeEnum.VIRTUAL"
          :value="bankTypeEnum.VIRTUAL"
        >
          {{ sysTranslationsDict['wallet.rapid.virtual'] }}
        </n-radio-button>
      </n-radio-group>
    </div>

    <div
      v-if="formData.bank_type === bankTypeEnum.BANK"
      class="form-group"
    >
      <label
        class="label"
        for="amount"
        >{{ sysTranslationsDict['wallet.pay.name'] }}</label
      >
      <!-- 使用 NInputNumber 替换 input 组件 -->
      <n-input
        v-model:value="formData.username"
        :min="0"
        :placeholder="sysTranslationsDict['sys.placeholder.input']"
      />
    </div>

    <div
      v-if="formData.bank_type === bankTypeEnum.VIRTUAL"
      class="form-group"
    >
      <label
        class="label"
        for="amount"
        >{{ sysTranslationsDict['wallet.virtual.currency'] }}</label
      >
      <!-- 使用 NInputNumber 替换 input 组件 -->
      <n-radio-group
        v-model:value="formData.bank_id"
        size="medium"
      >
        <n-radio-button
          v-for="virtualCard in virtualCards"
          :key="virtualCard.id"
          :value="virtualCard.id"
          @click="selectVirtualCard(virtualCard)"
        >
          {{ virtualCard.bank_name }}
        </n-radio-button>
      </n-radio-group>
    </div>

    <div
      v-if="formData.bank_type === bankTypeEnum.VIRTUAL"
      class="form-group"
    >
      <label
        class="label"
        for="amount"
        >{{
          `${sysTranslationsDict['wallet.virtual.currency']}
          ${sysTranslationsDict['sys.protocol']}`
        }}</label
      >
      <!-- 使用 NInputNumber 替换 input 组件 -->
      <n-radio-group
        v-model:value="formData.protocol_type"
        size="medium"
      >
        <n-radio-button
          v-for="protocolType in protocolTypeList"
          :key="protocolType"
          :value="protocolType"
        >
          {{ protocolType }}
        </n-radio-button>
      </n-radio-group>
    </div>

    <div class="form-group">
      <label
        class="label"
        for="amount"
        >{{ sysTranslationsDict['wallet.pay.amount'] }}</label
      >
      <!-- 使用 NInputNumber 替换 input 组件 -->
      <n-radio-group
        v-model:value="choseValue"
        size="medium"
        class="radio-group-wrap"
        style="width: 100%"
      >
        <n-radio
          v-for="amount in presetAmounts"
          :key="amount"
          :value="amount"
          @click="selectAmount(amount)"
        >
          {{ amount }}
        </n-radio>
        <n-radio
          :value="-1"
          @click="handleCustomAmount"
          >{{ sysTranslationsDict['sys.custom'] }}
        </n-radio>
      </n-radio-group>
    </div>
    <div
      v-if="showCustomAmount"
      class="form-group"
    >
      <!-- 使用 NInputNumber 替换 input 组件 -->
      <n-input-number
        id="amount"
        v-model="formData.amount"
        :min="0.01"
        :step="0.01"
        :placeholder="`${sysTranslationsDict['sys.placeholder.input']}`"
        :on-update:value="validateCustomAmount"
      />
    </div>
    <n-button
      type="primary"
      class="submit-button"
      @click="submit"
      :disabled="isFormValid"
      block
      >{{ sysTranslationsDict['sys.deposit.money'] }}
    </n-button>
  </n-card>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui';
import { ref, onMounted, computed } from 'vue';

import { createRechargeRecord, getBanks } from '@/api/wallet.ts';
import { bankTypeEnum } from '@/interface.ts';
import router, { mobileRouterName } from '@/router';
import { useCacheStore } from '@/store/cache';

const emits = defineEmits(['next']);

const message = useMessage();
const showCustomAmount = ref(false);
const choseValue = ref(0);
const presetAmounts = [100, 150, 200, 500, 1000, 2000];
const formData = ref<any>({
  bank_type: bankTypeEnum.BANK,
  bank_id: null,
  amount: null,
  username: null,
  protocol_type: null,
});
const virtualCards = ref<any[]>([]);
const protocolTypeList = ref<any>([]);
const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});

// 计算属性，用于检查表单是否有效
const isFormValid = computed(() => {
  // 检查银行类型是否选择
  if (!formData.value.bank_type) {
    return true;
  }

  // 检查金额是否有效 - 自定义金额时需要确保amount有值且大于0
  if (showCustomAmount.value) {
    // 自定义金额模式：必须有输入且大于0
    if (!formData.value.amount || formData.value.amount <= 0) {
      return true;
    }
  } else {
    // 非自定义金额模式：必须选择预设金额
    if (!formData.value.amount) {
      return true;
    }
  }

  // 银行支付模式需要检查用户名
  if (formData.value.bank_type === bankTypeEnum.BANK) {
    return !formData.value.username;
  }
  // 虚拟货币模式需要检查银行ID和协议类型
  else if (formData.value.bank_type === bankTypeEnum.VIRTUAL) {
    return !formData.value.bank_id || !formData.value.protocol_type;
  }

  return true;
});

async function fetchBanks() {
  try {
    const res = await getBanks({
      nowPage: 1,
      type: bankTypeEnum.VIRTUAL,
      pageSize: 1000,
      orderBy: 'desc',
      orderName: 'id',
    });
    if (res.code === 200) {
      virtualCards.value = res.data.rows;
    }
  } catch (error) {
    console.error('获取银行列表失败', error);
  }
}

function selectVirtualCard(virtualCard: any) {
  console.log('selectVirtualCard', virtualCard);
  protocolTypeList.value = virtualCard.protocol_type_list;
}

function selectAmount(amountValue: number) {
  formData.value.amount = amountValue;
  showCustomAmount.value = false;
}

// 处理自定义金额选择
function handleCustomAmount() {
  showCustomAmount.value = true;
  // 选择自定义时重置金额，这样用户必须输入金额后按钮才会变为可点击
  formData.value.amount = null;
}

// 验证自定义金额输入
function validateCustomAmount(value) {
  // 这里可以添加额外的验证逻辑，如果需要
  // 金额输入会自动通过n-input-number的min属性限制最小值
  formData.value.amount = value;
}

function submit() {
  // 表单验证通过后提交
  if (!isFormValid.value) {
    if (formData.value.bank_type === bankTypeEnum.BANK) {
      formData.value.status = -1;
    } else if (formData.value.bank_type === bankTypeEnum.VIRTUAL) {
      formData.value.status = 1;
    }
    createRechargeRecord(formData.value).then((res) => {
      if (res.code === 200) {
        message.success('提交成功');
        router.push({
          name: mobileRouterName.h5TransactionRecordDetail,
          query: { id: res.data.id },
        });
      }
    });
  }
}

function changeBankType(value) {
  console.log('changeBankType', value);

  formData.value.bank_type = value;
  if (value == bankTypeEnum.VIRTUAL) {
    formData.value.bank_id = virtualCards.value[0].id;
    protocolTypeList.value = virtualCards.value[0].protocol_type_list;
  } else {
    formData.value.bank_id = null;
  }
}

onMounted(() => {
  fetchBanks();
});
</script>

<style scoped lang="scss">
.form-group {
  margin-bottom: 15px;
}

.label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.radio-group-wrap {
  flex-wrap: wrap; /* 设置选项换行 */
}
</style>
