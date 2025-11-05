<template>
  <div class="h5-profile-wrap">
    <div class="center">
      <div class="avatar">
        <n-avatar
          round
          size="large"
          src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
        />
        <div
          v-if="userStore.userInfo"
          class="avatar-name"
        >
          <div>{{ userStore.userInfo.username }}</div>
          <div style="color: #8e8b8b">
            {{
              translateWithVars('common.join.kaiyun.sports.day', {
                days: getJoinDays,
              })
            }}
          </div>
        </div>
        <div
          v-else
          class="avatar-name"
        >
          <!-- sys.login: 登录文本, sys.register: 注册文本（中英文切换） -->
          <n-button @click="router.push({ name: mobileRouterName.h5Login })"
            >{{ sysTranslationsDict['sys.login'] }}/{{
              sysTranslationsDict['sys.register']
            }}
          </n-button>
        </div>
        <div>
          <n-float-button
            position="absolute"
            :right="50"
            :top="10"
            @click="router.push({ name: mobileRouterName.h5Setting })"
          >
            <n-icon>
              <SettingsOutline />
            </n-icon>
          </n-float-button>
          <n-float-button
            position="absolute"
            :right="0"
            :top="10"
            @click="router.push({ name: mobileRouterName.h5Message })"
          >
            <n-icon>
              <ChatbubbleEllipsesOutline />
            </n-icon>
          </n-float-button>
        </div>
      </div>

      <div class="user-center">
        <div class="label">
          {{ sysTranslationsDict['wallet.central'] }}
          <n-icon color="#c9ccd9">
            <Eye />
          </n-icon>
        </div>
        <div
          class="money"
          v-if="userStore.userInfo"
        >
          $ {{ userStore.userInfo.wallet?.balance }}
          <n-icon @click="refresh">
            <Refresh />
          </n-icon>
        </div>
        <n-grid
          :cols="4"
          :x-gap="4"
          y-gap="4"
          style="text-align: center"
        >
          <n-grid-item>
            <div @click="router.push({ name: routerName.h5TransactionRecord })">
              <img
                src="@/assets/img/tradeRecord.png"
                width="40vw"
              />
            </div>
            <div class="menu-title">
              <!--              交易记录-->
              {{ sysTranslationsDict['my.transaction.record'] }}
            </div>
          </n-grid-item>
          <n-grid-item>
            <div @click="router.push({ name: routerName.h5Votes })">
              <img
                src="@/assets/img/betPlacement.png"
                width="40vw"
              />
            </div>
            <div class="menu-title">
              <!--              投注记录-->
              {{ sysTranslationsDict['my.bet.record'] }}
            </div>
          </n-grid-item>
          <n-grid-item>
            <div>
              <img
                src="@/assets/img/returnWater.png"
                width="40vw"
              />
            </div>
            <div class="menu-title">
              <!--              实时返水-->
              {{ sysTranslationsDict['my.time.rebate'] }}
            </div>
          </n-grid-item>
          <n-grid-item>
            <div>
              <img
                src="@/assets/img/accountManagement.png"
                width="40vw"
              />
            </div>
            <div class="menu-title">
              <!--              账户管理-->
              {{ sysTranslationsDict['my.account.management'] }}
            </div>
          </n-grid-item>
        </n-grid>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ChatbubbleEllipsesOutline,
  Eye,
  Refresh,
  SettingsOutline,
} from '@vicons/ionicons5';
import { computed, onMounted } from 'vue';

// eslint-disable-next-line import/order
import router, { mobileRouterName, routerName } from '@/router';
import { useCacheStore } from '@/store/cache';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});

// 获取用户加入天数（这里暂时使用固定值，实际应该从userStore.userInfo中获取）
const getJoinDays = computed(() => {
  // 假设实际项目中，用户加入天数存储在userStore.userInfo.joinedDays中
  // 如果没有，则返回默认值796
  return 796;
});

// 处理带变量的国际化文本
const translateWithVars = (key, variables = {}) => {
  const template = sysTranslationsDict.value[key] || key;
  let result = template;

  // 替换模板中的变量
  Object.keys(variables).forEach((varName) => {
    const regex = new RegExp(`\\{${varName}\\}`);
    result = result.replace(regex, variables[varName]);
  });

  return result;
};

onMounted(() => {
  if (!userStore.userInfo) {
    router.push({ name: mobileRouterName.h5Login });
  }
});

const refresh = () => {
  userStore.getUserInfo();
};
</script>

<style lang="scss" scoped>
.h5-profile-wrap {
  background-color: #f2f1f6;
  height: 100vh;
  width: 100vw;
}

.center {
  padding: 4vh 5vw 0 5vw;
}

.avatar {
  display: flex;
  gap: 2vw;
  padding: 10px 0;
  font-size: 14px;
  align-items: center;
  position: relative;

  .avatar-name {
    /* 移除不必要的 margin 和 padding 计算 */
    margin: 0;
    padding: 0;
  }
}

.user-center {
  background: #fff;
  height: 25vh;
  border-radius: 10px;
  margin-top: 2vh;
  padding: 1vh 2vw;
  display: flex;
  flex-direction: column;
  gap: 1vh;

  .label {
    font-size: 16px;
    font-weight: 500;
  }

  .money {
    font-weight: bold;
    font-size: 18px;
  }
}

.menu-title {
  margin-top: 1vh;
}
</style>
