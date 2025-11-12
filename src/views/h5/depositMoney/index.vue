<template>
  <div class="deposit-container">
    <!-- 页面头部 -->
    <header class="header">
      <button
        class="back-button"
        type="button"
        @click="goBack"
      >
        <n-icon
          :component="ChevronBack"
          size="24"
        />
      </button>
      <!-- sys.deposit.money: 存款文本（中英文切换） -->
      <h1 class="page-title">{{ sysTranslationsDict['sys.deposit.money'] }}</h1>
      <div class="header-placeholder"></div>
    </header>
    <!-- 页面内容 -->
    <main class="content">
      <step1 @next="stepNext" />
      <!--      <step2-->
      <!--        v-else-if="current === 1"-->
      <!--        @next="stepNext"-->
      <!--        @cancel="cancelStep"-->
      <!--        :model-value="rechargeRecord"-->
      <!--      />-->
      <!--      <step3 v-else-if="current == 2" />-->
    </main>
  </div>
</template>

<script setup lang="ts">
import { ChevronBack } from '@vicons/ionicons5';
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
.deposit-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 30px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  height: 50px;
  padding-top: env(safe-area-inset-top, 0);
  position: relative;
  text-align: center;
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

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.header-placeholder {
  width: 40px;
  position: absolute;
  right: 16px;
}

.content {
  padding: 20px;
  background: #efeff1;
  flex: 1;
}

// 适配移动设备
@media (max-width: 480px) {
  .deposit-container {
    padding-bottom: 25px;
  }

  .header {
    height: 80px;
  }

  .content {
    padding: 16px;
  }

  .page-title {
    font-size: 17px;
  }
}
</style>
