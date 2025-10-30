<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';

import { fetchGetWsUserMessageList } from '@/api/wsMessage.ts';
import { useWebsocketIm } from '@/hooks/use-websocket-im'; // 假设路径正确
import router, { mobileRouterName } from '@/router';
import { useUserStore } from '@/store/user';
import { formatTimeHour } from '@/utils';
import { getToken } from '@/utils/localStorage/user.ts';

const userStore = useUserStore();
// 添加聊天列表的DOM引用
const chatListRef = ref<HTMLDivElement | null>(null);

const contactId = ref<number>();

// 引用 WebSocket 相关逻辑
const {
  initUserWs: initUserWs,
  danmuList,
  sendUserDanmuTxt,
} = useWebsocketIm();
// 输入的消息内容
const danmuStr = ref('');

const scrollToBottom = () => {
  nextTick(() => {
    if (chatListRef.value) {
      chatListRef.value.scrollTop = chatListRef.value.scrollHeight;
    }
  });
};

// 初始化 WebSocket
onMounted(() => {
  handleHistoryMsg();
  initUserWs({
    // 这里需要根据实际情况调整参数
    ws_user_contact_id: userStore.userInfo?.id,
  });
});

async function handleHistoryMsg() {
  try {
    const res = await fetchGetWsUserMessageList({
      source_user_id: userStore.userInfo?.id,
      target_user_id: 1,
    });
    if (res.code === 200) {
      console.log('handleHistoryMsg', res.data);
      res.data.list.forEach((v) => {
        danmuList.value.push(v);
      });
      contactId.value = res.data.contact;
      scrollToBottom();
    }
  } catch (error) {
    console.log(error);
  }
}

// 发送消息的函数
function handleSendDanmu() {
  const token = getToken();
  if (!token) {
    router.push({ name: mobileRouterName.h5Login });
  }
  if (danmuStr.value.trim()) {
    sendUserDanmuTxt(danmuStr.value, 1, contactId.value!);
    danmuStr.value = '';
  }
}

// 添加danmuList监听器
watch(danmuList.value, () => {
  scrollToBottom();
});
</script>

<template>
  <div class="customer-service-container">
    <!-- 聊天消息列表 -->
    <div
      ref="chatListRef"
      class="chat-list"
    >
      <div
        v-for="(item, index) in danmuList"
        :key="index"
        class="chat-item"
        :class="{
          'customer-msg': item.target_user_id == userStore.userInfo?.id,
        }"
      >
        <div class="chat-bubble">
          <span class="time">
            [{{ formatTimeHour(item.send_message_time!) }}]
          </span>
          <div class="message-content">
            <span class="name">
              {{
                item.target_user_id == userStore.userInfo?.id ? '客服' : '您'
              }}
            </span>
            <span class="separator">：</span>
            <span class="msg">
              {{ item.content }}
            </span>
            <!--            <div-->
            <!--              v-else-->
            <!--              class="msg img"-->
            <!--            >-->
            <!--              <img-->
            <!--                :src="item.content"-->
            <!--                alt=""-->
            <!--              />-->
            <!--            </div>-->
          </div>
        </div>
      </div>
    </div>
    <!-- 消息输入框和发送按钮 -->
    <div class="input-area">
      <input
        v-model="danmuStr"
        type="text"
        placeholder="请输入消息..."
        @keyup.enter="handleSendDanmu"
      />
      <button @click="handleSendDanmu">发送</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
// ... 原有样式代码 ...
.customer-service-container {
  display: flex;
  flex-direction: column;
  height: 85vh;
  padding: 10px;
  background-color: #f5f5f5;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}

.chat-item {
  display: flex;
  margin-bottom: 10px;

  &.customer-msg {
    justify-content: flex-end;
  }
}

.chat-bubble {
  max-width: 70%;
  padding: 10px;
  border-radius: 8px;
  background-color: white;

  &.customer-msg {
    background-color: #9eea6a;
  }
}

.time {
  font-size: 0.8em;
  color: #999;
  display: block;
  margin-bottom: 5px;
}

.message-content {
  display: flex;
  align-items: center;
}

.name {
  font-weight: bold;
  margin-right: 5px;
}

.separator {
  margin-right: 5px;
}

.msg {
  word-break: break-word;
}

.img img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.input-area {
  display: flex;
  gap: 10px;

  input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #0056b3;
    }
  }
}
</style>
