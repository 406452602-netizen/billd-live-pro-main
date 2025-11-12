<template>
  <div class="bank-card-list-container">
    <div class="title">
      <div class="card-header">
        <n-button
          :text="true"
          @click="goBack"
        >
          <n-icon :component="ArrowBack" />
        </n-button>
        <div>{{ sysTranslationsDict['wallet.bank'] }}</div>
        <div>&nbsp;</div>
      </div>
      <div class="mobile-steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="mobile-step"
          :class="{ active: index <= current }"
        >
          <div class="step-circle">
            {{ index + 1 }}
          </div>
          <div
            v-if="index < steps.length - 1"
            class="step-line"
          ></div>
          <div class="step-text">
            {{ step }}
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <step1
        v-if="current === 0"
        @next="stepNext"
      />
      <step2
        v-else-if="current === 1"
        :model-value="rechargeRecord"
        @next="stepNext"
        @cancel="cancelStep"
      />
      <step3 v-else-if="current == 2" />
      <step4
        v-else-if="current == 3"
        :status="result.status"
        :message="result.message"
        :remark="result.remark"
      />
    </div>

    <!--    <div class="bank-cards">-->
    <!--      <n-tabs-->
    <!--        v-model:value="tabinfo"-->
    <!--        type="line"-->
    <!--        animated-->
    <!--      >-->
    <!--        <n-tab-pane-->
    <!--          :name="bankTypeEnum.BANK"-->
    <!--          tab="银行卡账号"-->
    <!--        >-->
    <!--          <div-->
    <!--            v-for="card in bankCards"-->
    <!--            :key="card.id"-->
    <!--            class="bank-card"-->
    <!--            @click="goToDeposit(card)"-->
    <!--          >-->
    <!--            <div class="bank-name">{{ card.bank.bank_name }}</div>-->
    <!--            <div class="card-number">{{ card.card_number }}</div>-->
    <!--          </div>-->
    <!--        </n-tab-pane>-->
    <!--        <n-tab-pane-->
    <!--          :name="bankTypeEnum.VIRTUAL"-->
    <!--          tab="虚拟卡账号"-->
    <!--        >-->
    <!--          <div-->
    <!--            v-for="card in virtualCards"-->
    <!--            :key="card.id"-->
    <!--            class="bank-card"-->
    <!--            @click="goToDeposit(card)"-->
    <!--          >-->
    <!--            <div class="bank-name">{{ card.bank.bank_name }}</div>-->
    <!--            <div class="card-number">{{ card.card_number }}</div>-->
    <!--          </div>-->
    <!--        </n-tab-pane>-->
    <!--      </n-tabs>-->
    <!--    </div>-->
    <!--    <n-button-->
    <!--      type="primary"-->
    <!--      block-->
    <!--      @click="goToAddBankCard"-->
    <!--    >-->
    <!--      {{ tabinfo == bankTypeEnum.BANK ? '添加银行卡' : '添加虚拟账号' }}-->
    <!--    </n-button>-->
  </div>
</template>

<script setup lang="ts">
import { ArrowBack } from '@vicons/ionicons5';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getRechargeRecords, updateRecharge } from '@/api/wallet.ts';
import { auditStatusEnum } from '@/interface.ts';
import { useCacheStore } from '@/store/cache';

import Step1 from './step1.vue';
import Step2 from './step2.vue';
import Step3 from './step3.vue';
import Step4 from './step4.vue';

// const userStore = useUserStore();

const router = useRouter();
const route = useRoute();
const rechargeRecord = ref<any>({});
const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});

// const steps = ref(['提交订单', '待您付款', '上传凭证', '订单完成']);
const steps = ref([
  sysTranslationsDict.value['deposit.step.submit.order'],
  sysTranslationsDict.value['deposit.step.upon.payment'],
  sysTranslationsDict.value['deposit.step.upload.voucher'],
  sysTranslationsDict.value['deposit.step.order.completed'],
]);

const result = ref<any>({
  status: 'success',
  message: '',
  remark: null,
});

const expirationTime = 1000 * 60 * 60;

onMounted(() => {
  getRechargeRecords({
    id: route.query.id,
  }).then((res) => {
    if (res.code === 200 && res.data.rows.length > 0) {
      const data = res.data.rows[0];
      if (data.status === -1) {
        // 获取当前时间戳
        const currentTime = new Date().getTime();
        // 将 created_at 转换为时间戳
        const recordTime = new Date(data.created_at).getTime();
        const diffTimeStamp = currentTime - recordTime;
        // 计算时间差（单位：分钟）
        const diffMinutes = diffTimeStamp / (1000 * 60);
        console.log(
          '时间',
          diffMinutes,
          diffTimeStamp,
          recordTime,
          currentTime
        );
        // 判断是否超过 30 分钟
        if (diffMinutes > 60) {
          console.log('时间超过 30 分钟');
          updateRecharge({
            id: data.id,
            status: auditStatusEnum.CANCELED,
          });
        } else {
          console.log('时间未超过 30 分钟');
          current.value = 1;
          rechargeRecord.value = data;
          rechargeRecord.value.diffTimeStamp = expirationTime - diffTimeStamp;
        }
      } else if (data.status === 0) {
        rechargeRecord.value = data;
        current.value = 2;
      } else if (
        [
          auditStatusEnum.APPROVED,
          auditStatusEnum.REJECTED,
          auditStatusEnum.CANCELED,
        ].includes(data.status)
      ) {
        rechargeRecord.value = data;
        current.value = 3;
        if (data.status === auditStatusEnum.REJECTED) {
          result.value.status = 'error';
          result.value.message = '当前订单已被拒绝';
          result.value.remark = data.remark;
        }
        if (data.status === auditStatusEnum.CANCELED) {
          result.value.status = 'warning';
          result.value.message = '当前订单已被取消';
          result.value.remark = data.remark;
        }
        if (data.status === auditStatusEnum.APPROVED) {
          result.value.status = 'success';
          result.value.message = '当前订单成功充值';
          result.value.remark = data.remark;
        }
      }
    }
  });
});

// const tabinfo = ref(bankTypeEnum.BANK);

const current = ref(0);

function cancelStep() {
  current.value = 0;
}

function stepNext(data) {
  current.value += 1;
  rechargeRecord.value = data;
}

// async function fetchBankCards() {
//   try {
//     const res = await getBankCards({
//       user_id: userStore.userInfo?.id,
//       bank_type: 1,
//       nowPage: 1,
//       pageSize: 1000,
//       orderBy: 'desc',
//       orderName: 'id',
//     });
//     if (res.code === 200) {
//       bankCards.value = res.data.rows;
//     }
//
//     const res2 = await getBankCards({
//       user_id: userStore.userInfo?.id,
//       bank_type: 2,
//       nowPage: 1,
//       pageSize: 1000,
//       orderBy: 'desc',
//       orderName: 'id',
//     });
//     if (res2.code === 200) {
//       virtualCards.value = res2.data.rows;
//     }
//   } catch (error) {
//     console.error('获取银行卡失败', error);
//   }
// }

// function goToDeposit(data) {
//   console.log(data);
//   if (isLogin()) {
//     router.push({
//       name: mobileRouterName.h5RechargeMoney,
//       query: {
//         id: data.id.toString(),
//         cardNumber: data.card_number,
//         bank: data.bank.bank_name,
//       },
//     });
//   }
// }

// function isLogin() {
//   if (!userStore.userInfo?.id) {
//     message.warning('请先进行登录！');
//     router.push({ name: mobileRouterName.h5Login });
//     return false;
//   }
//   return true;
// }

// function goToAddBankCard() {
//   if (isLogin()) {
//     router.push({
//       name: mobileRouterName.h5AddBankCard,
//       query: {
//         bankType: tabinfo.value.toString(),
//       },
//     });
//   }
// }

function goBack() {
  router.go(-1);
}
</script>

<style scoped lang="scss">
.bank-card-list-container {
  max-width: 800px;
  margin: 0 auto;
  height: 90vh;
  overflow-y: scroll;
  background: #f4f9fd;
}

.title {
  background: #fff;
  padding: 20px;
}

.content {
  padding: 20px;
}

.bank-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.bank-card {
  padding: 20px;
  border-radius: 10px;
  background-color: #f0f2f5;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e6e8eb;
  }
}

.bank-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.card-number {
  font-size: 16px;
  color: #666;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// 步骤条
.mobile-steps {
  display: flex;
  align-items: center;
  margin: 20px 0;
  padding: 0 10px;
}

.mobile-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  z-index: 1;
}

.active .step-circle {
  background-color: #4d20ae;
}

.step-line {
  position: absolute;
  top: 12px;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: #e0e0e0;
}

:not(.active) ~ .mobile-step .step-line {
  background-color: #e0e0e0;
}

.active .step-line {
  background-color: #4d20ae;
}

.step-text {
  margin-top: 8px;
  font-size: 12px;
  text-align: center;
  color: #666;
}

.active .step-text {
  color: #4d20ae;
}
</style>
