<template>
  <div class="bottom-menu">
    <div
      v-for="menuItem in menuList"
      :key="menuItem.key"
      :class="[
        'menu-item',
        { active: currentRouteName === menuItem.routerName },
      ]"
      @click="handleMenuClick(menuItem)"
    >
      <n-icon
        class="menu-icon"
        :size="22"
      >
        <component :is="getIconComponent(menuItem.iconName)" />
      </n-icon>
      <div class="menu-key">{{ sysTranslationsDict[menuItem.title] }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  HomeOutline,
  WalletOutline,
  ChatboxEllipsesOutline,
  TrendingDownOutline,
  PersonOutline,
} from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
import { ref, watch, computed } from 'vue';
// 导入需要的图标
import { useRoute, useRouter } from 'vue-router';

import { mobileRouterName } from '@/router';
import { useCacheStore } from '@/store/cache';

const route = useRoute();
const router = useRouter();
const currentRouteName = ref(route.name as string);
const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});

// 监听路由变化，更新当前路由名称
watch(
  () => route.name,
  (newName) => {
    if (newName) {
      currentRouteName.value = newName as string;
    }
  }
);

// 定义菜单项，使用naiveui内置的图标名称
const menuList = [
  {
    key: 'home',
    title: 'sys.home',
    iconName: 'HomeOutline',
    routerName: mobileRouterName.h5,
  },
  {
    key: 'deposit',
    title: 'sys.deposit.money',
    iconName: 'WalletOutline',
    routerName: mobileRouterName.h5DepositMoney,
  },
  {
    key: 'customer',
    title: 'sys.customer.service',
    iconName: 'ChatboxEllipsesOutline',
    routerName: mobileRouterName.h5CustomerService,
  },
  {
    key: 'withdraw',
    title: 'sys.withdraw.money',
    iconName: 'TrendingDownOutline',
    routerName: mobileRouterName.h5WithdrawMoney,
  },
  {
    key: 'user',
    title: 'sys.mine',
    iconName: 'PersonOutline',
    routerName: mobileRouterName.h5My,
  },
];

function handleMenuClick(menuItem: (typeof menuList)[0]) {
  router.push({ name: menuItem.routerName });
}

// 根据图标名称返回对应的组件
function getIconComponent(iconName: string) {
  const iconMap: Record<string, any> = {
    HomeOutline,
    WalletOutline,
    ChatboxEllipsesOutline,
    TrendingDownOutline,
    PersonOutline,
  };
  return iconMap[iconName] || HomeOutline;
}
</script>

<style scoped>
.bottom-menu {
  background-color: #ffffff;
  height: 60px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.menu-item {
  width: 20%;
  text-align: center;
  padding: 8px 0 5px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.menu-icon {
  margin-bottom: 2px;
  color: #666666;
}

.svg-icon {
  width: 100%;
  height: 100%;
  transition: all 0.3s;
  /* 通过filter控制SVG图标颜色 */
  filter: brightness(0) saturate(100%) invert(51%) sepia(0%) saturate(0%)
    hue-rotate(325deg) brightness(96%) contrast(93%);
}

.menu-key {
  font-size: 12px;
  margin-top: 2px;
  color: #666666;
}

.menu-item.active .menu-key {
  color: #7a57d1;
  font-weight: 500;
}

.menu-item.active .menu-icon {
  color: #7a57d1;
}

.menu-item.active .svg-icon {
  /* 选中状态显示紫色 */
  filter: brightness(0) saturate(100%) invert(57%) sepia(24%) saturate(2188%)
    hue-rotate(257deg) brightness(92%) contrast(94%);
}
</style>
