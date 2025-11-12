<template>
  <div class="h5-profile-wrap">
    <n-card :bordered="false">
      <div class="head">
        <n-button
          type="primary"
          size="large"
          text
          @click="() => router.go(-1)"
        >
          <n-icon :component="ChevronBack" />
        </n-button>
        <div>设置</div>
        <div>&nbsp;</div>
      </div>
    </n-card>
    <n-button
      style="margin: 10px 0 0 0; background: #fff"
      size="large"
      block
      secondary
      strong
      @click="handleLogout"
      >退出
    </n-button>
  </div>
</template>

<script lang="ts" setup>
import { ChevronBack } from '@vicons/ionicons5';

const userStore = useUserStore();
import router, { mobileRouterName } from '@/router';
import { useUserStore } from '@/store/user';

function handleLogout() {
  userStore.logout();
  router.push({ name: mobileRouterName.h5 });
  // setTimeout(() => {
  //   windowReload();
  // }, 500);
}
</script>

<style lang="scss" scoped>
.h5-profile-wrap {
  background: #f8f8f8;
  height: 100vh;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
