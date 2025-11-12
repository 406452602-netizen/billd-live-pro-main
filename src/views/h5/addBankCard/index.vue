<template>
  <div class="add-bank-card-container">
    <n-card :bordered="false">
      <div class="head">
        <n-button
          :text="true"
          @click="goBack"
        >
          <n-icon :component="ChevronBack" />
        </n-button>
        <div>
          {{
            bankType == bankTypeEnum.BANK
              ? `${sysTranslationsDict['sys.add']} ${sysTranslationsDict['wallet.bank.card']}`
              : `${sysTranslationsDict['sys.add']} ${sysTranslationsDict['wallet.virtual.account']}`
          }}
        </div>
        <div>&nbsp;</div>
      </div>
    </n-card>
    <n-card class="form-container">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
      >
        <n-form-item
          path="bank_id"
          class="form-group"
          :label="`${sysTranslationsDict['sys.placeholder.chose']}${
            bankType == bankTypeEnum.BANK
              ? sysTranslationsDict['wallet.bank']
              : sysTranslationsDict['wallet.virtual.currency']
          }`"
        >
          <!-- 使用 NSelect 替换 select 组件 -->
          <n-select
            v-model:value="formData.bank_id"
            :placeholder="`${sysTranslationsDict['sys.placeholder.chose']}${
              bankType == bankTypeEnum.BANK
                ? sysTranslationsDict['wallet.bank']
                : sysTranslationsDict['wallet.virtual.currency']
            }`"
            :options="banks"
            label-field="bank_name"
            value-field="id"
            @change="handleBankChange"
          >
          </n-select>
        </n-form-item>
        <n-form-item
          path="card_number"
          class="form-group"
          :label="
            bankType == bankTypeEnum.BANK
              ? sysTranslationsDict['wallet.bank.card']
              : sysTranslationsDict['wallet.virtual.account']
          "
        >
          <!-- 使用 NInput 替换 input 组件 -->
          <n-input
            id="cardNumber"
            v-model:value="formData.card_number"
            :placeholder="`${sysTranslationsDict['sys.placeholder.input']}${
              bankType == bankTypeEnum.BANK
                ? sysTranslationsDict['wallet.bank.card']
                : sysTranslationsDict['wallet.virtual.account']
            }`"
          />
        </n-form-item>
        <!--选择类型-->
        <n-form-item
          v-if="cardTypeOption.length > 0"
          :label="
            bankType == bankTypeEnum.BANK
              ? sysTranslationsDict['sys.type']
              : sysTranslationsDict['sys.protocol']
          "
        >
          <n-radio-group
            v-model:value="formData.protocol_type"
            :theme-overrides="radioButtonOverrides"
            class="card-type-radio-group"
          >
            <n-radio-button
              v-for="item in cardTypeOption"
              :key="item"
              :label="item"
              :value="item"
            >
              {{ sysTranslationsDict[item] || item }}
            </n-radio-button>
          </n-radio-group>
        </n-form-item>
        <n-form-item
          class="form-group"
          path="holder_name"
          :label="sysTranslationsDict['wallet.hold.bank.card']"
        >
          <!-- 使用 NInput 替换 input 组件 -->
          <n-input
            id="holderName"
            v-model:value="formData.holder_name"
            :placeholder="`${sysTranslationsDict['sys.placeholder.input']}
            ${sysTranslationsDict['wallet.hold.bank.card']}`"
          />
        </n-form-item>
        <n-button
          type="primary"
          block
          @click="handleAddBankCard"
          >{{ sysTranslationsDict['sys.add'] }}
        </n-button>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ChevronBack } from '@vicons/ionicons5';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { createUserBankCard, getBanks } from '@/api/wallet.ts';
import { bankTypeEnum } from '@/interface.ts';
import { useCacheStore } from '@/store/cache';
import { useUserStore } from '@/store/user';

import type { FormItemRule, FormRules } from 'naive-ui';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const banks = ref<any[]>([]);
const bankType = ref<any>();
const cardTypeOption = ref<any>([]);

const formRef = ref<any>();

const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});

// 自定义银行卡号校验函数
const validateCardNumber = (rule: FormItemRule, value: string) => {
  const cardNumberRegex = /^\d{12,20}$/;
  if (!cardNumberRegex.test(value)) {
    return new Error('请输入有效的银行卡号');
  }
  console.log(rule);
  return true;
};

// 自定义持卡人姓名校验函数
const validateHolderName = (rule: FormItemRule, value: string) => {
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z]+$/;
  if (!nameRegex.test(value)) {
    return new Error('请输入有效的持卡人姓名');
  }
  console.log(rule);
  return true;
};

const handleBankChange = (value, info) => {
  console.log(value, info);
  cardTypeOption.value = info.protocol_type_list;
  return value;
};

// 定义校验规则
const rules = ref<FormRules>({
  bank_id: [
    {
      required: true,
      message: '请选择银行',
    },
  ],
  card_number: [
    {
      required: true,
      message: '请输入银行卡号',
      trigger: 'blur',
    },
    {
      validator: validateCardNumber, // 校验银行卡号长度为 12 到 20 位数字
      message: '请输入有效的银行卡号',
      trigger: 'blur',
    },
  ],
  holder_name: [
    {
      required: true,
      message: '请输入持卡人姓名',
      trigger: 'blur',
    },
    {
      validator: validateHolderName,
      message: '请输入有效的持卡人姓名',
      trigger: 'blur',
    },
  ],
  protocol_type: [
    {
      required: true,
      message: '请选择协议',
    },
  ],
});

const formData = ref<any>({
  bank_id: null,
  holder_name: null,
  card_number: null,
  protocol_type: null,
});

// 单选按钮主题配置
const radioButtonOverrides = {
  buttonTextColorActive: '#fff',
  buttonColorActive: '#722ed1',
  buttonTextColor: '#722ed1',
  buttonColor: '#fff',
  buttonBoxShadowHover: 'inset 0 0 0 1px #722ed1',
  buttonBorderColor: '#722ed1',
  buttonBorderColorActive: '#722ed1',
};

onMounted(async () => {
  bankType.value = Number(route.query.bankType);
  await fetchBanks();
});

async function fetchBanks() {
  try {
    const res = await getBanks({
      nowPage: 1,
      type: bankType.value,
      pageSize: 1000,
      orderBy: 'desc',
      orderName: 'id',
    });
    if (res.code === 200) {
      banks.value = res.data.rows;
    }
  } catch (error) {
    console.error('获取银行列表失败', error);
  }
}

function handleAddBankCard() {
  formRef.value.validate(async (error) => {
    if (!error) {
      const res = await createUserBankCard({
        user_id: userStore.userInfo?.id,
        bank_id: formData.value.bank_id,
        card_number: formData.value.card_number,
        holder_name: formData.value.holder_name,
      });
      if (res.code === 200) {
        alert('银行卡添加成功');
        goBack();
      }
    }
    console.log(error);
  });
}

function goBack() {
  router.go(-1);
}
</script>

<style scoped lang="scss">
.add-bank-card-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

<style>
.n-radio-group .n-radio-group__splitor {
  vertical-align: top;
  display: none;
}

.n-radio-button {
  border-radius: 0 !important;
}

.n-radio-button:first-child {
  border-top-left-radius: 4px !important;
  border-bottom-left-radius: 4px !important;
}

.n-radio-button:last-child {
  border-top-right-radius: 4px !important;
  border-bottom-right-radius: 4px !important;
}

.n-radio-button:not(:last-child) {
  margin-right: 0 !important;
}

.card-type-radio-group {
  width: 100%;
  max-width: 400px;
}

.card-type-radio-group .n-radio-button {
  font-size: 14px;
}
</style>
