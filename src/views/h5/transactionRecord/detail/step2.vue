<template>
  <n-card>
    <n-flex
      justify="center"
      align="center"
      vertical
    >
      <div>{{ data.amount }}元</div>
      <div>请在 {{ formatTime(remainingTime) }} 内完成支付</div>
    </n-flex>
    <div class="info">
      <span>{{ targetBank.holder_name }}</span>
      <span style="font-size: 10px; color: #8e8b8b"
        >（{{ targetBank.bank.bank_name }}）</span
      >
      <n-button
        size="small"
        style="float: right"
        @click="copyText(targetBank.holder_name)"
        >复制
      </n-button>
    </div>
    <div class="info">
      {{ targetBank.card_number }}
      <n-button
        size="small"
        style="float: right"
        @click="copyText(targetBank.card_number)"
        >复制
      </n-button>
    </div>
    <div class="info">
      <span>金额：</span>
      <span>{{ data.amount }}</span>
      <n-button
        size="small"
        style="float: right"
        @click="copyText(data.amount.toString())"
        >复制
      </n-button>
    </div>
  </n-card>
  <n-card class="important-tip">
    <p>重要提示：</p>
    <ul>
      <li>请确保汇款金额与显示金额一致。</li>
      <li>汇款时备注正确的交易信息。</li>
      <li>若半小时内未完成支付，本次存款将自动取消。</li>
    </ul>
  </n-card>
  <n-flex
    justify="center"
    gap="large"
  >
    <n-button
      type="error"
      @click="cancelDeposit"
      >未支付并取消存款
    </n-button>
    <n-button
      type="primary"
      @click="uploadVoucher"
      >已支付并上传凭证
    </n-button>
  </n-flex>

  <n-drawer
    v-model:show="showUploadModal"
    placement="bottom"
    :height="500"
  >
    <template #header>
      <div class="drawer-header">上传回执</div>
    </template>
    <div class="custom-drawer">
      <n-card>
        <div style="margin-bottom: 10px">请上传该存款的完整信息回执</div>
        <div class="drawer-content">
          <n-upload
            v-model:file-list="fileList"
            action="#"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :default-upload="false"
            list-type="image-card"
            class="upload-section"
          >
            上传回执
          </n-upload>
          <a
            href="#"
            target="_blank"
            class="example-link"
            >回执示例</a
          >
        </div>
        <div class="requirement-section">
          <p class="requirement-title">回执单要求：</p>
          <ul class="requirement-list">
            <li>清晰显示汇款金额和收款人信息。</li>
            <li>文件格式支持 JPG、PNG、PDF。</li>
            <li>文件大小不超过 5MB。</li>
          </ul>
        </div>
      </n-card>
    </div>
    <n-card>
      <n-button
        type="primary"
        class="submit-button"
        block
        @click="submitVoucher"
        >提交凭证并确认付款
      </n-button>
      <div style="margin-top: 10px">
        <n-icon :component="AlertCircleOutline"></n-icon>
        请勿上传虚假交易截图，违者将面临扣盈利和封号处罚！
      </div>
    </n-card>
  </n-drawer>
</template>
<script setup lang="ts">
// eslint-disable-next-line import/order
import { auditStatusEnum } from '@/interface.ts';

const emits = defineEmits(['next', 'cancel']);
const props = withDefaults(
  defineProps<{
    modelValue?: any;
  }>(),
  {
    modelValue: () => {},
  }
);

import { AlertCircleOutline } from '@vicons/ionicons5';
import { copyToClipBoard } from 'billd-utils';
import { useMessage } from 'naive-ui';
import { ref, onMounted, onUnmounted } from 'vue';

import { uploadFile } from '@/api/upload.ts';
import { getUseRechargeTarget, updateRecharge } from '@/api/wallet.ts';

import type { UploadFileInfo } from 'naive-ui';

const fileList = ref<UploadFileInfo[]>([]);

const message = useMessage();
const showUploadModal = ref(false);

// 模拟需要支付的金额
const data = ref<any>({
  amount: 200,
});

const targetBank = ref<any>({
  holder_name: '张三',
  card_number: '6216000000000000000',
  bank: {
    bank_name: '中国建设银行',
  },
});
// 半小时倒计时（单位：秒）
const remainingTime = ref(30 * 60);
const remainingMinutes = ref(Math.floor(remainingTime.value / 60));
const remainingSeconds = ref<any>(remainingTime.value % 60);

let timer: NodeJS.Timer;

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(Math.floor(secs)).padStart(2, '0')}`;
};

const updateTimer = () => {
  remainingTime.value -= 1;
  remainingMinutes.value = Math.floor(remainingTime.value / 60);
  remainingSeconds.value = remainingTime.value % 60;

  if (remainingTime.value <= 0) {
    clearInterval(timer);
    message.warning('支付超时，本次存款已自动取消');
    emits('cancel');
  }
};

const copyText = (text: string) => {
  if (!text) {
    message.error('复制内容不能为空');
    return;
  }
  copyToClipBoard(text);
  // 2. 现代浏览器 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('复制成功');
      })
      .catch((error) => {
        console.log(error);
        // API 失败时降级到备用方案
        fallbackCopyText(text);
      });
  } else {
    // 不支持 Clipboard API 时直接使用备用方案
    fallbackCopyText(text);
  }
};

// 备用复制方案 (兼容旧浏览器)
const fallbackCopyText = (text: string) => {
  // 创建临时文本区域
  const textarea = document.createElement('textarea');
  textarea.value = text;

  // 隐藏元素但保持可选中
  textarea.style.position = 'fixed';
  textarea.style.top = '-999px';
  textarea.style.left = '-999px';

  document.body.appendChild(textarea);
  textarea.select();

  try {
    // 执行复制命令
    const successful = document.execCommand('copy');
    if (successful) {
      message.success('复制成功');
    } else {
      message.error('复制失败，请手动复制');
    }
  } catch (err) {
    message.error('复制失败，请手动复制');
  } finally {
    // 清理临时元素
    document.body.removeChild(textarea);
  }
};

const handleUploadSuccess = () => {
  message.success('上传成功');
};

const handleUploadError = () => {
  message.error('上传失败');
};

const upload = async (file) => {
  try {
    const res = await uploadFile({
      file: file.file!,
    });
    return res.data.imageUrl;
  } catch (error) {
    console.log(error);
  }
};

async function startUpload() {
  const queue: string[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const v of fileList.value) {
    if (v.file) {
      queue.push(await upload(v));
    }
  }

  return queue;
}

onMounted(() => {
  data.value = props.modelValue;
  if (data.value.diffTimeStamp) {
    remainingTime.value = data.value.diffTimeStamp / 1000;
  }
  timer = setInterval(updateTimer, 1000);
  getUseRechargeTarget().then((res) => {
    if (res.code === 200) {
      targetBank.value = res.data;
    }
  });
});

onUnmounted(() => {
  clearInterval(timer);
});

const cancelDeposit = () => {
  updateRecharge({
    status: auditStatusEnum.CANCELED,
    id: data.value.id,
  }).then((res) => {
    if (res.code === 200) {
      message.success('本次存款已取消');
      emits('cancel');
    }
  });
};

const uploadVoucher = () => {
  showUploadModal.value = true;
  // 这里添加上传凭证的逻辑
};
const submitVoucher = async () => {
  const image: any[] = await startUpload();

  console.log('fileList', fileList.value, image);
  updateRecharge({
    voucher: image.join(','),
    status: 0,
    id: data.value.id,
  }).then((res) => {
    if (res.code === 200) {
      message.success('提交凭证成功，等待审核');
      data.value.status = 0;
      emits('next', data.value);
    }
  });
};
</script>
<style scoped lang="scss">
.info {
  margin: 20px 0;
  border-radius: 4px;
}

.important-tip {
  margin: 20px 0;
  padding: 15px;
  background-color: #fff6e6;
  border-left: 4px solid #faad14;
  border-radius: 4px;

  p {
    margin: 0 0 10px 0;
    font-weight: bold;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 5px;
  }
}

/* 优化 n-drawer 样式 */
.custom-drawer {
  background: #f4f9fd;
  padding: 20px;

  .drawer-header {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  .drawer-content {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
  }

  .upload-section {
    .n-button {
      padding: 8px 16px;
    }
  }

  .example-link {
    color: #1890ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .requirement-section {
    margin-bottom: 20px;
  }

  .requirement-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .requirement-list {
    list-style-type: disc;
    padding-left: 20px;
    margin: 0;
  }

  .submit-button {
    margin-top: 10px;
  }
}
</style>
