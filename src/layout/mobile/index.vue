<template>
  <div class="layout">
    <!--    <HeadCpt></HeadCpt>-->
    <router-view v-slot="{ Component }">
      <component :is="Component"></component>
    </router-view>
    <LoginModal v-if="appStore.showLoginModal"></LoginModal>
    <BottomMenu></BottomMenu>
  </div>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/store/app';

import BottomMenu from './foot/index.vue';
// import HeadCpt from './head/index.vue';

const appStore = useAppStore();
</script>

<style lang="scss" scoped></style>
