<template>
  <div
    v-if="showModal"
    class="h5-profile-wrap"
    @click.self.stop="handleClose"
  >
    <div class="content">
      <i
        class="close"
        @click="handleClose"
      ></i>
      <n-card>
        <n-form :model="formData">
          <n-grid :cols="1">
            <n-grid-item>
              <n-space justify="center">
                <n-image
                  :src="AXIOS_BASEURL + selectedTeam.team_logo"
                  width="50vh"
                ></n-image>
              </n-space>
            </n-grid-item>
            <n-grid-item>
              <n-space justify="center">
                {{ selectedTeam.team_name }}
              </n-space>
            </n-grid-item>
            <n-grid-item v-if="matchVotes.votes_type != voteType.oddPurchase">
              <n-space justify="center">
                {{ selectedOdds }}
              </n-space>
            </n-grid-item>
          </n-grid>
          <!--          <n-form-item label="投票类型">-->
          <!--            <n-select-->
          <!--              v-model:value="formData.votes_type"-->
          <!--              :render-label="renderSelectLabel"-->
          <!--              :options="voteTypeOption"-->
          <!--            >-->
          <!--            </n-select>-->
          <!--          </n-form-item>-->
          <!--          <n-form-item-->
          <!--            label="额外增加球数（即对手需要额外数量的球获胜）"-->
          <!--            v-if="formData.votes_type == 1"-->
          <!--          >-->
          <!--            <n-input v-model:value="formData.handicap" />-->
          <!--          </n-form-item>-->
          <n-descriptions bordered>
            <n-descriptions-item
              v-for="item in letScoreDetail"
              :key="item.bureau_index"
              :label="`小局胜负让分第${item.bureau_index + 1}局`"
            >
              <div v-if="formData.vote_index == 1">
                {{ item.team1_fraction }}
              </div>
              <div v-else>{{ item.team2_fraction }}</div>
            </n-descriptions-item>
            <n-descriptions-item
              v-if="formData.votes_type == voteType.oddPurchase"
              label="底分"
            >
              {{ reservePriceRef }}
            </n-descriptions-item>
            <n-descriptions-item
              v-if="formData.votes_type == voteType.oddPurchase"
              label="最大分差"
            >
              {{ matchVotes.maximum_differential }}
            </n-descriptions-item>
          </n-descriptions>
          <n-form-item
            v-if="![voteType.oddPurchase].includes(formData.votes_type)"
            label="投票金额"
          >
            <!-- sys.placeholder.input: 输入提示文本（中英文切换） -->
            <n-input-number
              v-model:value="formData.vote_amount"
              :min="reservePriceRef"
              :placeholder="`${sysTranslationsDict['sys.placeholder.input']}`"
            />
          </n-form-item>
          <div v-else>
            <n-form-item label="输入倍率">
              <!-- sys.placeholder.input: 输入提示文本（中英文切换） -->
              <n-input-number
                v-model:value="formData.odds"
                :placeholder="`${sysTranslationsDict['sys.placeholder.input']}`"
                @change="changeOdds"
              />
            </n-form-item>
            <n-statistic
              v-if="formData.votes_type == voteType.oddPurchase"
              label="结算金额"
              :value="formData.vote_amount"
            >
            </n-statistic>
          </div>
          <n-button
            block
            @click="submitForm"
            >提交
          </n-button>
        </n-form>
      </n-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import { SelectOption } from 'naive-ui';
import { computed, ref } from 'vue';

import { createVote } from '@/api/quiz.ts';
// import { voteTypeMap } from '@/constant.ts';
import { voteType } from '@/interface.ts';
import { AXIOS_BASEURL } from '@/spec-config';
import { useCacheStore } from '@/store/cache';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const matchVotes = ref();
// const voteTypeOption = Object.keys(voteTypeMap).map((v) => {
//   return {
//     label: voteTypeMap[v],
//     value: Number(v),
//   };
// });

const emits = defineEmits(['update:showModal', 'close']);
const showModal = ref(false);
const reservePriceRef = ref();
const selectedTeam = ref({
  team_name: '',
  team_logo: '',
});
const letScoreDetail = ref<any>([]);
const selectedOdds = ref(0);
const formData = ref<any>({
  handicap: 0,
  vote_amount: '',
  vote_index: 1,
  match_id: '',
  votes_type: 0,
  user_id: -1,
  odds: -1,
  bureau_index: undefined,
});
const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});

// function renderSelectLabel(option: SelectOption) {
//   return (option.label as string) || '';
// }

// 提交表单方法
const submitForm = () => {
  console.log('提交的数据:', formData.value);
  emits('update:showModal', false);
  createVote(formData.value).then((res) => {
    if (res.code === 200) {
      window.$message.success('投票成功');
      showModal.value = false;
      userStore.getUserInfo();
    }
  });
};

const changeOdds = (item) => {
  console.log('item', item);
  formData.value.vote_amount =
    item *
    (Number(matchVotes.value.maximum_differential) +
      Number(matchVotes.value.reserve_price));
};

const initForm = ({
  vote_index: voteIndex,
  odds,
  match,
  matchVote,
  ball = 0,
}) => {
  if (!userStore.userInfo) {
    window.$message.warning('请先选择登录');
    return false;
  }
  reservePriceRef.value = matchVote.reserve_price;
  formData.value = {
    handicap: ball,
    vote_amount: '',
    vote_index: Number(voteIndex),
    odds,
    user_id: Number(userStore.userInfo?.id),
    votes_type: matchVote.votes_type,
    bureau_index: matchVote.bureau_index,
    match_id: match.match_id,
  };
  matchVotes.value = matchVote;
  if (Number(voteIndex) === 1) {
    selectedTeam.value = match.team1;
  } else {
    selectedTeam.value = match.team2;
  }
  if (formData.value.votes_type == voteType.overGameLetBall) {
    letScoreDetail.value = matchVote.let_score_detail;
  } else {
    letScoreDetail.value = [];
  }
  selectedOdds.value = odds;
  showModal.value = true;
  return true;
};

function handleClose() {
  emits('close');
  showModal.value = false;
}

defineExpose({
  initForm,
});
</script>

<style lang="scss" scoped>
.h5-profile-wrap {
  padding: 0 20px;
  margin-top: 5px;
  z-index: 100;
  @extend %maskBg;

  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 350px;
    border-radius: 5px;
    background-color: #fff;
    transform: translate(-50%, -50%);
  }

  .close {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1;
    width: 18px;
    height: 18px;
    cursor: pointer;

    @include cross(#ccc, 3px);
  }
}
</style>
