<template>
  <div class="bottom-menu">
    <div
      v-for="item in menuItems"
      :key="item.key"
      class="menu-item"
      :class="{ active: route.name === item.routeName }"
      @click="changeRoute(item)"
    >
      <n-image
        :src="item.label"
        :preview-disabled="true"
        width="24"
        height="24"
      ></n-image>
      <!-- 动态国际化文本（中英文切换） -->
      <span class="menu-key">{{ sysTranslationsDict[item.key] }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import { Home, People } from '@vicons/ionicons5';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import customerService from '@/assets/img/customerService.png';
import depositMoney from '@/assets/img/depositMoney.png';
import home from '@/assets/img/home.png';
import mine from '@/assets/img/mine.png';
import withdrawMoney from '@/assets/img/withdrawMoney.png';
import router, { mobileRouterName } from '@/router';
import { useCacheStore } from '@/store/cache';

const route = useRoute();
const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});

const menuItems = [
  { label: home, key: 'sys.home', routeName: mobileRouterName.h5 },
  {
    label: depositMoney,
    key: 'sys.deposit.money',
    routeName: mobileRouterName.h5DepositMoney,
  },
  {
    label: customerService,
    key: 'sys.customer.service',
    routeName: mobileRouterName.h5CustomerService,
  },
  {
    label: withdrawMoney,
    key: 'sys.withdraw.money',
    routeName: mobileRouterName.h5WithdrawMoney,
  },
  { label: mine, key: 'sys.mine', routeName: mobileRouterName.h5My },
];

function changeRoute(item: (typeof menuItems)[0]) {
  router.push({ name: item.routeName });
}
</script>

<style lang="scss" scoped>
.bottom-menu {
  display: flex;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;

  .menu-item {
    flex: 1;
    text-align: center;
    padding: 15px 0;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;

    &:hover {
      background-color: #f0f0f0;
    }

    &.active {
      color: #ff6600; // 激活状态文字颜色，可根据需求修改
    }

    .menu-key {
      font-size: 12px;
    }
  }
}
</style>
