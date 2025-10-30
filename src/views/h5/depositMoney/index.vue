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
        <div>{{ sysTranslationsDict['sys.deposit.money'] }}</div>
        <div>&nbsp;</div>
      </div>
    </div>
    <div class="content">
      <step1 @next="stepNext" />
      <!--      <step2-->
      <!--        v-else-if="current === 1"-->
      <!--        @next="stepNext"-->
      <!--        @cancel="cancelStep"-->
      <!--        :model-value="rechargeRecord"-->
      <!--      />-->
      <!--      <step3 v-else-if="current == 2" />-->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowBack } from '@vicons/ionicons5';
// import { useMessage } from 'naive-ui';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

// const message = useMessage();

import { getRechargeRecords, updateRecharge } from '@/api/wallet.ts';
import { auditStatusEnum } from '@/interface.ts';
// import { mobileRouterName } from '@/router';
import { useCacheStore } from '@/store/cache';
// import { useUserStore } from '@/store/user';
import Step1 from '@/views/h5/depositMoney/step1.vue';

// const userStore = useUserStore();
const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});

const router = useRouter();
const rechargeRecord = ref<any>({});

onMounted(() => {
  getRechargeRecords({
    // user_id: userStore.userInfo?.id,
    status: '-1,0',
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
        if (diffMinutes > 30) {
          console.log('时间超过 30 分钟');
          updateRecharge({
            id: data.id,
            status: auditStatusEnum.REJECTED,
          });
        } else {
          console.log('时间未超过 30 分钟');
          rechargeRecord.value = data;
          rechargeRecord.value.diffTimeStamp = diffTimeStamp;
        }
      } else {
        rechargeRecord.value = data;
      }
    }
  });
});

// const tabinfo = ref(bankTypeEnum.BANK);

function stepNext(data) {
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
  background-color: #1890ff;
}

.step-line {
  position: absolute;
  top: 12px;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: #e0e0e0;
}

.active ~ .mobile-step .step-line {
  background-color: #e0e0e0;
}

.active .step-line {
  background-color: #1890ff;
}

.step-text {
  margin-top: 8px;
  font-size: 12px;
  text-align: center;
  color: #666;
}

.active .step-text {
  color: #1890ff;
}
</style>
