<template>
  <div class="select-media-wrap">
    <Modal
      title="选择直播素材"
      :mask-closable="true"
      :width="'520px'"
      @close="emits('close')"
    >
      <div class="btn-wrap">
        <div
          v-for="(item, index) in obj"
          :key="index"
          class="btn"
        >
          <n-button @click="emits('ok', item[1].type)">
            {{ item[1].txt }}
          </n-button>
        </div>
      </div>

      <template #footer></template>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { MediaTypeEnum } from '@/interface';
import { objectSort } from '@/utils';

const props = withDefaults(
  defineProps<{
    allMediaTypeList: {
      [index: string]: {
        type: MediaTypeEnum;
        txt: string;
      };
    };
  }>(),
  {}
);
const emits = defineEmits(['close', 'ok']);

const obj = ref();
onMounted(() => {
  obj.value = objectSort({
    obj: props.allMediaTypeList,
    sortField: 'priority',
    sort: 'asc',
  });
});
</script>

<style lang="scss" scoped>
.select-media-wrap {
  .btn-wrap {
    display: flex;
    flex-wrap: wrap;

    .btn {
      margin-right: 12px;
      margin-bottom: 12px;
    }
  }
}
</style>
