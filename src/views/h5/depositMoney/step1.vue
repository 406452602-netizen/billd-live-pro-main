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
          @click="showCustomAmount = true"
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
        :min="0"
        :placeholder="`${sysTranslationsDict['sys.placeholder.input']}}`"
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
  if (!formData.value.bank_type || !formData.value.amount) {
    return true;
  }

  if (formData.value.bank_type === bankTypeEnum.BANK) {
    console.log(
      '进入了 BANK',
      formData.value.username,
      !formData.value.username
    );
    return !formData.value.username;
  } else if (formData.value.bank_type === bankTypeEnum.VIRTUAL) {
    console.log(
      '进入了 VIRTUAL',
      formData.value.bank_id,
      formData.value.protocol_type,
      !!formData.value.bank_id
    );
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
  protocolTypeList.value = virtualCard.protocol_type_list;
}

function selectAmount(amountValue: number) {
  formData.value.amount = amountValue;
  showCustomAmount.value = false;
}

function submit() {
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
