<template>
  <div class="h5-head-wrap">
    <div class="logo-bar">
      <div
        class="logo"
        @click="router.push({ name: mobileRouterName.h5 })"
      ></div>
      <div class="top-right">
        <!--        <a-->
        <!--          class="github"-->
        <!--          target="_blank"-->
        <!--          href="https://github.com/galaxy-s10/billd-live"-->
        <!--        >-->
        <!--          <img-->
        <!--            :src="githubStar"-->
        <!--            alt=""-->
        <!--          />-->
        <!--          <img-->
        <!--            :src="githubFork"-->
        <!--            alt=""-->
        <!--          />-->
        <!--        </a>-->
        <span class="github">
          <n-button text> GALAXY99 </n-button>
        </span>
        <n-dropdown
          trigger="click"
          class="github"
          :options="optionLocation"
          @select="handleSelectLocation"
        >
          {{ locale }}
        </n-dropdown>
        <n-badge @click="router.push({ name: mobileRouterName.h5Message })">
          <!--          <template #value>-->
          <!--            <n-icon size="10">-->
          <!--              <svg-->
          <!--                xmlns="http://www.w3.org/2000/svg"-->
          <!--                xmlns:xlink="http://www.w3.org/1999/xlink"-->
          <!--                viewBox="0 0 32 32"-->
          <!--              >-->
          <!--                <path-->
          <!--                  d="M11.61 29.92a1 1 0 0 1-.6-1.07L12.83 17H8a1 1 0 0 1-1-1.23l3-13A1 1 0 0 1 11 2h10a1 1 0 0 1 .78.37a1 1 0 0 1 .2.85L20.25 11H25a1 1 0 0 1 .9.56a1 1 0 0 1-.11 1l-13 17A1 1 0 0 1 12 30a1.09 1.09 0 0 1-.39-.08zM17.75 13l2-9H11.8L9.26 15h5.91l-1.59 10.28L23 13z"-->
          <!--                  fill="currentColor"-->
          <!--                ></path>-->
          <!--              </svg>-->
          <!--            </n-icon>-->
          <!--          </template>-->
          <n-icon size="20">
            <ChatbubbleEllipsesOutline />
          </n-icon>
        </n-badge>

        <!--        <template v-if="!userStore.userInfo">-->
        <!--          <div-->
        <!--            class="btn"-->
        <!--            @click="appStore.showLoginModal = true"-->
        <!--          >-->
        <!--            {{ sysTranslationsDict['sys.login'] }}-->
        <!--          </div>-->
        <!--        </template>-->
        <!--        <n-dropdown-->
        <!--          v-else-->
        <!--          trigger="click"-->
        <!--          :options="options"-->
        <!--          @select="handleSelect"-->
        <!--        >-->
        <!--          <Avatar-->
        <!--            :url="userStore.userInfo.avatar"-->
        <!--            :name="userStore.userInfo.username"-->
        <!--            :size="30"-->
        <!--          ></Avatar>-->
        <!--        </n-dropdown>-->
      </div>
    </div>
    <!--    <nav class="nav-list">-->
    <!--      <div-->
    <!--        v-for="(item, index) in appStore.navList"-->
    <!--        :key="index"-->
    <!--        class="item"-->
    <!--        :class="{ active: route.name === item.routeName }"-->
    <!--        @click="changeRoute(item)"-->
    <!--      >-->
    <!--        {{ item.name }}-->
    <!--      </div>-->
    <!--    </nav>-->
  </div>
</template>

<script lang="ts" setup>
import { ChatbubbleEllipsesOutline } from '@vicons/ionicons5';
import { onMounted, ref, computed } from 'vue';
// import { useRoute } from 'vue-router';

import router, { mobileRouterName } from '@/router';
// import { AppRootState, useAppStore } from '@/store/app';
// import { useAppStore } from '@/store/app';
import { useCacheStore } from '@/store/cache';
// import { useUserStore } from '@/store/user';

const githubStar = ref();
const githubFork = ref();
// const route = useRoute();
// const appStore = useAppStore();
// const userStore = useUserStore();
const cacheStore = useCacheStore();
const locale = computed(() => {
  return cacheStore.locale;
});
// const sysTranslationsDict = computed(() => {
//   return cacheStore.sysTranslationsDict;
// });
// const options = [
//   // { label: '个人信息', key: '1' },
//   { label: '退出登录', key: 'logout' },
// ];

const optionLocation = computed(() => {
  return cacheStore.localeList.map((item) => {
    return {
      label: item.label,
      key: item.value,
    };
  });
});

onMounted(() => {
  githubStar.value =
    'https://img.shields.io/github/stars/galaxy-s10/billd-live.svg?label=Star&logo=GitHub&labelColor=white&logoColor=black&style=social&maxAge=86400';
  githubFork.value =
    'https://img.shields.io/github/forks/galaxy-s10/billd-live.svg?label=Fork&logo=GitHub&labelColor=white&logoColor=black&style=social&maxAge=86400';
});

// function handleSelect(key) {
//   if (key === 'logout') {
//     userStore.logout();
//   }
// }

function handleSelectLocation(key) {
  cacheStore.setLocale(key);
}

// function changeRoute(item: AppRootState['navList'][0]) {
//   router.push({ name: item.routeName });
// }
</script>

<style lang="scss" scoped>
.h5-head-wrap {
  .logo-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 15px;
    height: 100px;
    border-bottom: 1px solid #e7e7e7;
    background-color: white;

    .logo {
      width: 90px;
      height: 100px;

      @include setBackground('@/assets/img/logo.png');
    }

    .top-right {
      display: flex;
      align-items: center;

      .github {
        display: flex;
        margin-right: 10px;

        img {
          margin-left: 6px;
        }
      }

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: papayawhip;
        font-size: 12px;
        cursor: pointer;

        @extend %coverBg;
      }
    }
  }

  .nav-list {
    display: flex;
    align-items: center;
    height: 40px;
    background-color: white;
    line-height: 40px;

    .item {
      position: relative;
      margin: 0 15px;

      &.active {
        &::after {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 4px;
          background-color: $theme-color-gold;
          content: '';
        }
      }
    }
  }
}
</style>
