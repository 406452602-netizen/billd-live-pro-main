<template>
  <div class="layout">
    <!--    <HeadCpt></HeadCpt>-->
    <div class="show-display">
      <router-view v-slot="{ Component }">
        <component :is="Component"></component>
      </router-view>
      <LoginModal v-if="appStore.showLoginModal"></LoginModal>
    </div>
    <div class="bottom">
      <BottomMenu></BottomMenu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/store/app';

import BottomMenu from './foot/index.vue';
// import HeadCpt from './head/index.vue';

const appStore = useAppStore();
</script>

<style lang="scss" scoped>
.layout {
  min-height: 100vh;
  box-sizing: border-box;
}

.show-display {
  height: 90vh;
  overflow-y: scroll;
}

.bottom {
  height: 10vh;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
