<template>
  <div class="deposit-form">
    <!-- 支付方式选择 -->
    <div class="form-section">
      <label class="section-label">{{
        sysTranslationsDict['wallet.pay.method']
      }}</label>
      <n-tabs
        type="segment"
        animated
        :v-model:value="formData.bank_type"
        :theme-overrides="tabsOverrides"
        @update:value="changeBankType"
      >
        <!--快速转卡-->
        <n-tab-pane
          :name="bankTypeEnum.BANK"
          :tab="sysTranslationsDict['wallet.rapid.card']"
        >
          <div class="form-section">
            <label class="section-label">
              <!--              支付人姓名-->
              {{ sysTranslationsDict['wallet.pay.name'] }}
            </label>
            <n-input
              v-model:value="formData.username"
              :placeholder="sysTranslationsDict['sys.placeholder.input']"
              size="large"
              class="custom-input"
            />
          </div>
          <!-- 支付金额选择 -->
          <div class="form-section">
            <label class="section-label">
              <!--支付金额-->
              {{ sysTranslationsDict['wallet.pay.amount'] }}
            </label>
            <div class="amount-options">
              <n-radio-group
                v-model:value="choseValue"
                size="medium"
                class="grid-layout"
              >
                <n-radio
                  v-for="amount in presetAmounts"
                  :key="amount"
                  :value="amount"
                  class="amount-option"
                  @click="selectAmount(amount)"
                >
                  {{ amount }}
                </n-radio>
                <n-radio
                  :value="-1"
                  class="amount-option custom-option"
                  @click="handleCustomAmount"
                >
                  <!--自定义-->
                  {{ sysTranslationsDict['sys.custom'] }}
                </n-radio>
              </n-radio-group>
            </div>
            <!-- 自定义金额输入 -->
            <div
              v-if="showCustomAmount"
              class="form-section"
            >
              <n-input
                id="amount"
                v-model="formData.amount"
                :allow-input="onlyAllowNumber"
                :min="0.01"
                :step="0.01"
                :placeholder="sysTranslationsDict['sys.placeholder.input']"
                size="large"
                :on-update:value="validateCustomAmount"
                class="custom-input"
              />
            </div>
          </div>
        </n-tab-pane>
        <!--快速虚拟币-->
        <n-tab-pane
          :name="bankTypeEnum.VIRTUAL"
          :tab="sysTranslationsDict['wallet.rapid.virtual']"
        >
          <!-- 虚拟卡选择 -->
          <div
            v-if="formData.bank_type === bankTypeEnum.VIRTUAL"
            class="form-section"
          >
            <label class="section-label">{{
              sysTranslationsDict['wallet.virtual.currency']
            }}</label>
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
          <!-- 协议类型选择 -->
          <div
            v-if="formData.bank_type === bankTypeEnum.VIRTUAL"
            class="form-section"
          >
            <label class="section-label">
              <!--              协议类型 -->
              {{
                `${sysTranslationsDict['wallet.virtual.currency']}
          ${sysTranslationsDict['sys.protocol']}`
              }}
            </label>
            <n-radio-group
              v-model:value="formData.protocol_type"
              size="medium"
            >
              <n-radio-button
                v-for="protocolType in protocolTypeList"
                :key="protocolType"
                :value="protocolType"
                class="protocol-tab"
              >
                {{ protocolType }}
              </n-radio-button>
            </n-radio-group>
          </div>
          <!-- 支付金额选择 -->
          <div class="form-section">
            <label class="section-label">
              <!--支付金额-->
              {{ sysTranslationsDict['wallet.pay.amount'] }}</label
            >
            <div class="amount-options">
              <n-radio-group
                v-model:value="choseValue"
                size="medium"
                class="grid-layout"
              >
                <n-radio
                  v-for="amount in presetAmounts"
                  :key="amount"
                  :value="amount"
                  class="amount-option"
                  @click="selectAmount(amount)"
                >
                  {{ amount }}
                </n-radio>
                <n-radio
                  :value="-1"
                  class="amount-option custom-option"
                  @click="handleCustomAmount"
                >
                  <!-- sys.custom: 自定义文本（中英文切换） -->
                  {{ sysTranslationsDict['sys.custom'] }}
                </n-radio>
              </n-radio-group>
            </div>
          </div>

          <!-- 自定义金额输入 -->
          <div
            v-if="showCustomAmount"
            class="form-section"
          >
            <n-input
              id="amount"
              v-model="formData.amount"
              :allow-input="onlyAllowNumber"
              :min="0.01"
              :step="0.01"
              :placeholder="sysTranslationsDict['sys.placeholder.input']"
              size="large"
              :on-update:value="validateCustomAmount"
              class="custom-input"
            />
          </div>
        </n-tab-pane>
      </n-tabs>

      <!-- 存款按钮 -->
      <n-button
        type="primary"
        class="deposit-button"
        :disabled="isFormValid"
        block
        @click="submit"
      >
        {{ sysTranslationsDict['sys.deposit.money'] }}
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TabsProps, useMessage } from 'naive-ui';
import { computed, onMounted, ref } from 'vue';

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

const onlyAllowNumber = (value: string) => !value || /^\d+$/.test(value);

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
  console.log('isFormValid', formData.value);

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
  console.log('selectAmount', amountValue);
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

<style lang="scss">
.deposit-form {
  background-color: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  margin-bottom: 12px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.payment-type-tabs {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.payment-tab {
  flex: 1;
  height: 40px;
  font-size: 15px;
  border-color: #e8e8e8;
}

.payment-tab.n-radio-button--active {
  background-color: #7a57d1 !important;
  color: white !important;
  border-color: #7a57d1 !important;
}

.payment-tab.n-radio-button--active::after {
  box-shadow: none !important;
}

.custom-input {
  height: 50px;
  width: 100%;
  border-radius: 8px;
  font-size: 16px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s;
}

.custom-input:focus {
  border-color: #7a57d1;
  box-shadow: 0 0 0 2px rgba(122, 87, 209, 0.1);
}

.grid-layout {
  //display: grid;
  //grid-template-columns: repeat(3, 1fr);
}

//.amount-option {
//  display: flex;
//  align-items: center;
//  justify-content: center;
//}

//.amount-option .n-radio {
//  display: flex;
//  align-items: center;
//  justify-content: center;
//}
//
//.amount-option .n-radio__border {
//  width: 20px;
//  height: 20px;
//  border: 2px solid #d9d9d9;
//  transition: all 0.3s;
//  flex-shrink: 0;
//}
//
//.amount-option .n-radio__border::after {
//  width: 10px;
//  height: 10px;
//}
//
//.amount-option.n-radio--checked .n-radio__border {
//  border-color: #7a57d1 !important;
//  background-color: #7a57d1 !important;
//}
//
//.amount-option .n-radio__label {
//  font-size: 16px;
//  padding-left: 8px;
//  margin-right: auto;
//  white-space: nowrap;
//}

.deposit-button {
  width: 100%;
  height: 50px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 25px;
  color: white;
  margin-top: 30px;
  transition: all 0.3s;
}

// 适配移动设备
@media (max-width: 480px) {
  .deposit-form {
    padding: 18px;
    border-radius: 16px;
  }

  .form-section {
    margin-bottom: 20px;
  }

  .section-label {
    font-size: 15px;
    margin-bottom: 10px;
  }

  .grid-layout {
    gap: 10px;
  }

  .amount-option .n-radio__label {
    font-size: 15px;
  }

  .payment-tab {
    font-size: 14px;
  }

  .custom-input {
    height: 46px;
    font-size: 15px;
  }

  .deposit-button {
    height: 46px;
    font-size: 17px;
    margin-top: 25px;
  }
}

.tab-pane-background {
  background: white;
}

.n-tabs .n-tabs-rail {
  padding: 0;
  border: 1px solid #4d20ae;
}
</style>
