<template>
  <div class="h5-profile-wrap">
    <!-- 页面头部 -->
    <div class="header">
      <!-- 返回按钮 -->
      <n-button
        text
        @click="goBack"
      >
        <n-icon>
          <ArrowBack />
        </n-icon>
      </n-button>
      <!-- 菜单 -->
      <div class="menu">
        <!-- sys.today: 今日文本（中英文切换） -->
        <button
          :class="{ active: currentTab === MATCH_LIST_TYPE.TODAY.id }"
          @click="changeTab(MATCH_LIST_TYPE.TODAY.id)"
        >
          {{ sysTranslationsDict['sys.today'] }}
        </button>
        <!-- sys.rolling.ball: 滚球文本（中英文切换） -->
        <button
          :class="{ active: currentTab === MATCH_LIST_TYPE.ROLLING_BALL.id }"
          @click="changeTab(MATCH_LIST_TYPE.ROLLING_BALL.id)"
        >
          {{ sysTranslationsDict['sys.rolling.ball'] }}
        </button>
        <!-- sys.morning.session: 早场文本（中英文切换） -->
        <button
          :class="{ active: currentTab === MATCH_LIST_TYPE.MORNING_SESSION.id }"
          @click="changeTab(MATCH_LIST_TYPE.MORNING_SESSION.id)"
        >
          {{ sysTranslationsDict['sys.morning.session'] }}
        </button>
      </div>
      <!-- 剩余金额显示 -->
      <div class="balance">
        <span v-if="userStore.userInfo">
          <img
            src="@/assets/img/coin.png"
            width="16"
            height="16"
            alt="余额"
          />{{ userStore.userInfo.wallet?.balance }}</span
        >
        <span
          v-else
          @click="router.push({ name: routerName.h5Login })"
          >登录
        </span>
      </div>
    </div>
    <div class="divider"></div>
    <n-collapse
      :key="defaultExpandedNames.length"
      :default-expanded-names="defaultExpandedNames"
      arrow-placement="right"
    >
      <template #arrow></template>
      <n-collapse-item
        v-for="(item, index) in matchList"
        :key="index"
        :name="index"
      >
        <template #header>
          <div class="match-title">
            <span class="match-line">|</span>{{ item.season_name }} ({{
              item.match.length
            }})
          </div>
        </template>
        <n-list clickable>
          <n-list-item
            v-for="(matches, index) in item.match"
            :key="index"
            header-class="vote"
            content-class="vote"
            @click="goRoom(matches)"
          >
            <div>
              <n-icon :component="Time" />
              {{ matches.created_at }}
              <span style="margin-left: 2vw">{{ matches.description }}</span>
            </div>
            <n-space
              justify="space-around"
              size="large"
              align="center"
            >
              <n-space
                style="text-align: center"
                justify="space-between"
                align="center"
              >
                <n-image
                  width="30vw"
                  height="30vw"
                  :src="AXIOS_BASEURL + matches.team1.team_logo"
                />
                <span>{{ matches.team1.team_name }}</span>
              </n-space>
              <div style="font-size: 15px">V S</div>
              <n-space
                style="text-align: center"
                justify="space-between"
                align="center"
              >
                <n-image
                  width="30vw"
                  height="30vw"
                  :src="AXIOS_BASEURL + matches.team2.team_logo"
                />
                <span>{{ matches.team2.team_name }}</span>
              </n-space>
            </n-space>
            <n-grid
              x-gap="5"
              :cols="2"
            >
              <n-grid-item>
                <div v-if="matches.matchVotes.length > 0">
                  <div
                    v-for="(matchVote, ind) in matches.matchVotes"
                    :key="ind"
                  >
                    <n-button
                      v-if="matchVote.votes_type == voteType.winLoss"
                      block
                      @click.stop="votesOpen(matches, matchVote, 1)"
                    >
                      <template
                        v-if="matchVote.is_lock"
                        #icon
                      >
                        <n-icon>
                          <LockClosedOutline />
                        </n-icon>
                      </template>
                      {{ getVotesTitle(matchVote, 0) }}
                      赔率:{{ matchVote.team1_odds }}
                    </n-button>
                  </div>
                </div>
                <n-button
                  v-else
                  block
                >
                  <template #icon>
                    <n-icon>
                      <LockClosedOutline />
                    </n-icon>
                  </template>
                </n-button>
              </n-grid-item>
              <n-grid-item>
                <div v-if="matches.matchVotes.length > 0">
                  <div
                    v-for="(matchVote, ind) in matches.matchVotes"
                    :key="ind"
                  >
                    <n-button
                      v-if="matchVote.votes_type == voteType.winLoss"
                      block
                      @click.stop="votesOpen(matches, matchVote, 2)"
                    >
                      <template
                        v-if="matchVote.is_lock"
                        #icon
                      >
                        <n-icon>
                          <LockClosedOutline />
                        </n-icon>
                      </template>

                      {{ getVotesTitle(matchVote, 1) }}
                      赔率:{{ matchVote.team2_odds }}
                    </n-button>
                  </div>
                </div>
                <n-button
                  v-else
                  block
                >
                  <template #icon>
                    <n-icon>
                      <LockClosedOutline />
                    </n-icon>
                  </template>
                </n-button>
              </n-grid-item>
            </n-grid>
          </n-list-item>
        </n-list>
      </n-collapse-item>
    </n-collapse>

    <Votes ref="votesRef"></Votes>
  </div>
</template>

<script lang="ts" setup>
import { ArrowBack, LockClosedOutline, Time } from '@vicons/ionicons5';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { withdrawGameBalanceAll } from '@/api/game.ts';
import { seasonsPublicList } from '@/api/quiz.ts';
import { MATCH_LIST_TYPE, URL_QUERY } from '@/constant.ts';
// import { voteType } from '@/interface.ts';
import { voteType } from '@/interface.ts';
import { routerName } from '@/router';
import { AXIOS_BASEURL } from '@/spec-config.ts';
import { useCacheStore } from '@/store/cache';
import { useUserStore } from '@/store/user';
import Votes from '@/views/h5/room/votes/index.vue';

const votesRef = ref<InstanceType<typeof Votes> | null>(null);

const matchList = ref<any>([]);
const defaultExpandedNames = ref<any>([]);

const router = useRouter();
// 当前选中的菜单标签
const currentTab = ref<any>(MATCH_LIST_TYPE.TODAY.id);
// 剩余金额
const userStore = useUserStore();
const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});

// 返回上一页
const goBack = () => {
  router.back();
};

// 切换菜单标签
const changeTab = (tab) => {
  currentTab.value = tab;
  getSeasonsPublicList(tab);
};

function getVotesTitle(item, index) {
  console.log(item, index);
  // let title;
  // let fraction;
  //
  // if (index == 0) {
  //   title = matches.value.team1.team_name;
  //   fraction = Number(item.team1_fraction);
  // } else {
  //   title = matches.value.team2.team_name;
  //   fraction = Number(item.team2_fraction);
  // }
  //
  // switch (item.votes_type) {
  //   case voteType.winLoss:
  //     return title;
  //   case voteType.letBall:
  //     if (index == 0) {
  //       return `主 ${title} ${fraction.toFixed(0)}`;
  //     } else {
  //       return `客 ${title} ${fraction.toFixed(0)}`;
  //     }
  //   case voteType.gameNumber:
  //     if (index == 0) {
  //       return `大 ${fraction}`;
  //     } else {
  //       return `小 ${fraction}`;
  //     }
  // }
}

function votesOpen(match, item, teamIndex = 1) {
  console.log('votesOpen', match, item);
  if (item.is_lock || match.status > 1) {
    window.$message.warning('该盘口已结束或已关闭盘口');
    return;
  }
  let odds, ball;
  if (teamIndex == 1) {
    odds = item.team1_odds;
    ball = item.team1_fraction;
  } else if (teamIndex == 2) {
    odds = item.team2_odds;
    ball = item.team2_fraction;
  }
  let info;
  if (item.votes_type == voteType.winLoss) {
    info = votesRef.value?.initForm({
      vote_index: teamIndex,
      odds,
      match,
      matchVote: item,
    });
  } else {
    info = votesRef.value?.initForm({
      vote_index: teamIndex,
      odds,
      match,
      matchVote: item,
      ball,
    });
  }
  if (!info) {
    router.push({ name: routerName.h5Login });
  }
}

function getSeasonsPublicList(type) {
  seasonsPublicList(type).then((res) => {
    if (res.code === 200) {
      console.log('getMatchList', res.data);
      defaultExpandedNames.value = [];
      for (let i = 0; i < res.data.length; i += 1) {
        defaultExpandedNames.value.push(i);
      }
      matchList.value = res.data;
    }
  });
}

function goRoom(item, isBilibili = false) {
  if (isBilibili) {
    router.push({
      name: routerName.h5Room,
      params: { roomId: item.live_room_id },
      query: { [URL_QUERY.isBilibili]: 'true' },
    });
    return;
  }
  // if (!item.live) {
  //   window.$message.info('该直播间没在直播~');
  //   return;
  // }
  router.push({
    name: routerName.h5Room,
    params: { roomId: item.live_room_id },
    query: {
      matchId: item.match_id,
    },
  });
}

const withdrawGameAll = async () => {
  // 检查用户是否登录
  if (!userStore.userInfo) {
    return;
  }

  // 用户已登录，执行提现操作
  const response = await withdrawGameBalanceAll();
  if (response.code === 200) {
    await userStore.getUserInfo();
  }
};

onMounted(() => {
  getSeasonsPublicList(currentTab.value);
  withdrawGameAll();
});
</script>

<style lang="scss" scoped>
.h5-profile-wrap {
  padding: 0 20px;
  margin-top: 5px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu {
  display: flex;
  gap: 10px;
}

.menu button {
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.menu button.active {
  background-color: #007bff;
  color: white;
}

.balance {
  font-weight: bold;
}

.competition-list {
  /* 可根据实际需求添加样式 */
  margin-bottom: 20px;
}

.match-title {
  width: 100%;

  .match-line {
    color: #459cf7;
    margin: 0 5px;
  }
}

.divider {
  border: none;
  background-color: #b4daf5;
  height: 1px;
  width: 100vw;
  margin: 1vh -20px;
}
</style>
