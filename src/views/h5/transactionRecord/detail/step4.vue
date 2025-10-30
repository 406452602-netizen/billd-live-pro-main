<script setup lang="ts">
import { mobileRouterName } from '@/router';

const props = withDefaults(
  defineProps<{
    message?: any;
    status?:
      | 'info'
      | 'success'
      | 'warning'
      | 'error'
      | '404'
      | '403'
      | '500'
      | '418';
    remark: string;
  }>(),
  {
    message: () => {},
    status: 'error',
  }
);

const { message, status, remark } = props;
</script>
<template>
  <n-card>
    <n-result
      :status="status"
      :title="message"
      :description="remark"
    >
      <!--      <div v-if="remark">备注:{{ remark }}</div>-->
      <template #footer>
        <router-link :to="{ name: mobileRouterName.h5CustomerService }">
          <n-button
            block
            type="primary"
          >
            联系客服
          </n-button>
        </router-link>
        <!--        <n-button>我喜欢</n-button>-->
      </template>
    </n-result>
  </n-card>
</template>

<style scoped lang="scss"></style>
