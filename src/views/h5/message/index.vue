<template>
  <div class="h5-profile-wrap">
    <div class="head">
      <n-icon>
        <ChevronBack />
      </n-icon>
      <div class="head-center">
        <n-tabs
          :bar-width="10"
          type="segment"
          animated
        >
          <n-tab name="1"> 消息中心</n-tab>
          <n-tab name="2"> 私信通知</n-tab>
        </n-tabs>
      </div>
      <n-icon>
        <EllipsisHorizontalOutline />
      </n-icon>
    </div>
    <n-tabs
      type="line"
      :bar-width="50"
      justify-content="space-around"
    >
      <n-tab-pane
        name="chap1"
        tab="通知"
      >
        <n-empty
          size="large"
          :description="sysTranslationsDict['sys.message.empty']"
        >
          <!--          <template #icon>-->
          <!--            <n-icon>-->
          <!--            </n-icon>-->
          <!--          </template>-->
          <template #extra>
            <!--            {{ sysTranslationsDict['sys.message.empty'] }}-->
          </template>
        </n-empty>
      </n-tab-pane>
      <n-tab-pane
        name="chap2"
        tab="活动"
      >
        <n-empty
          size="large"
          :description="sysTranslationsDict['sys.message.empty']"
        >
          <template #extra>
            <!--            {{ sysTranslationsDict['sys.message.empty'] }}-->
          </template>
        </n-empty>
      </n-tab-pane>
      <n-tab-pane
        name="chap3"
        tab="公告"
      >
        <n-empty
          size="large"
          :description="sysTranslationsDict['sys.message.empty']"
        >
          <template #extra>
            <!--            {{ sysTranslationsDict['sys.message.empty'] }}-->
          </template>
        </n-empty>
      </n-tab-pane>
      <n-tab-pane
        name="chap4"
        tab="充提"
      >
        <n-empty
          size="large"
          :description="sysTranslationsDict['sys.message.empty']"
        >
          <template #extra>
            <!--            {{ sysTranslationsDict['sys.message.empty'] }}-->
          </template>
        </n-empty>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ChevronBack, EllipsisHorizontalOutline } from '@vicons/ionicons5';
import { computed } from 'vue';

import { useCacheStore } from '@/store/cache';

const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});
</script>

<style lang="scss" scoped>
.h5-profile-wrap {
  padding: 0 20px;
  margin-top: 5px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;

  &-center {
    min-width: 150px;
  }
}
</style>
