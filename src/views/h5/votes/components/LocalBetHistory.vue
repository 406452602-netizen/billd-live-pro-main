<template>
  <n-collapse :default-expanded-names="['0', '1']">
    <!-- 今日投注记录 -->
    <n-collapse-item
      name="0"
      :title="`今日投注记录(${localTodayData.totalBets}注)`"
    >
      <div class="statistic-summary">
        <n-grid
          cols="3"
          :col-gap="10"
        >
          <n-grid-item>
            <n-statistic
              :value="localTodayData.totalBets"
              class="statistic-value"
              label="总投注注数"
            />
          </n-grid-item>
          <n-grid-item>
            <n-statistic
              :value="localTodayData.totalTurnover"
              class="statistic-value"
              label="总投注金额"
            />
          </n-grid-item>
          <n-grid-item>
            <n-statistic
              :value="localTodayData.totalProfit"
              class="statistic-value"
              :class="localTodayData.totalProfit >= 0 ? 'win' : 'lose'"
              label="总净利润"
            />
          </n-grid-item>
        </n-grid>
      </div>
      <div
        v-if="localTodayData.list.length === 0"
        class="empty-data"
      >
        暂无投注记录
      </div>
      <n-card
        v-for="(item, index) in localTodayData.list"
        v-else
        :key="index"
        :bordered="false"
        class="bet-history-card"
      >
        <div class="bet-card-header">
          <span class="match-name">{{ getMatchName(item) }}</span>
          <n-button
            size="small"
            text
            class="toggle-button"
            @click="toggleShow(index, 'today')"
          >
            <n-icon
              :class="
                todayToggleStates[index] ? 'arrow-icon rotate' : 'arrow-icon'
              "
            >
              <ChevronDown />
            </n-icon>
          </n-button>
        </div>
        <div class="bet-info">
          <n-grid cols="3">
            <n-grid-item>
              <n-statistic
                :value="item.vote_amount"
                suffix=""
                class="statistic-value"
                label="投注金额"
              />
            </n-grid-item>
            <n-grid-item>
              <n-statistic
                :value="item.odds"
                suffix=""
                class="statistic-value"
                label="赔率"
              />
            </n-grid-item>
            <n-grid-item>
              <n-statistic
                :value="
                  item.prize_winner === 1
                    ? item.vote_amount * item.odds
                    : item.prize_winner === 0
                      ? 0
                      : '-'
                "
                suffix=""
                class="statistic-value"
                label="结算金额"
              />
            </n-grid-item>
          </n-grid>
        </div>
        <div
          v-if="todayToggleStates[index]"
          class="bet-details"
        >
          <div class="detail-row">
            <span class="detail-label">投注类型：</span>
            <span class="detail-value">{{
              getVotesTypeText(item.votes_type)
            }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">投注选项：</span>
            <span class="detail-value">{{ getVotes(item) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">投注结果：</span>
            <span
              class="detail-value"
              :class="getResultClass(item.prize_winner)"
            >
              {{ getResultText(item.prize_winner) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">投注时间：</span>
            <span class="detail-value">{{ item.created_at }}</span>
          </div>
        </div>
      </n-card>
    </n-collapse-item>

    <!-- 历史投注记录 -->
    <n-collapse-item
      name="1"
      :title="`历史投注记录(${localHistoryData.totalBets}注)`"
    >
      <div class="statistic-summary">
        <n-grid
          cols="3"
          :col-gap="10"
        >
          <n-grid-item>
            <n-statistic
              :value="localHistoryData.totalBets"
              class="statistic-value"
              label="总投注注数"
            />
          </n-grid-item>
          <n-grid-item>
            <n-statistic
              :value="localHistoryData.totalTurnover"
              class="statistic-value"
              label="总投注金额"
            />
          </n-grid-item>
          <n-grid-item>
            <n-statistic
              :value="localHistoryData.totalProfit"
              class="statistic-value"
              :class="localHistoryData.totalProfit >= 0 ? 'win' : 'lose'"
              label="总净利润"
            />
          </n-grid-item>
        </n-grid>
      </div>
      <div
        v-if="localHistoryData.list.length === 0"
        class="empty-data"
      >
        暂无投注记录
      </div>
      <n-card
        v-else
        :bordered="false"
        class="bet-history-card"
        v-for="(item, index) in localHistoryData.list"
        :key="index"
      >
        <div class="bet-card-header">
          <span class="match-name">{{ getMatchName(item) }}</span>
          <n-button
            size="small"
            text
            class="toggle-button"
            @click="toggleShow(index, 'history')"
          >
            <n-icon
              :class="
                historyToggleStates[index] ? 'arrow-icon rotate' : 'arrow-icon'
              "
            >
              <ChevronDown />
            </n-icon>
          </n-button>
        </div>
        <div class="bet-info">
          <n-grid cols="3">
            <n-grid-item>
              <n-statistic
                :value="item.vote_amount"
                suffix=""
                class="statistic-value"
                label="投注金额"
              />
            </n-grid-item>
            <n-grid-item>
              <n-statistic
                :value="item.odds"
                suffix=""
                class="statistic-value"
                label="赔率"
              />
            </n-grid-item>
            <n-grid-item>
              <n-statistic
                :value="
                  item.prize_winner === 1
                    ? item.vote_amount * item.odds
                    : item.prize_winner === 0
                      ? 0
                      : '-'
                "
                suffix=""
                class="statistic-value"
                label="结算金额"
              />
            </n-grid-item>
          </n-grid>
        </div>
        <div
          v-if="historyToggleStates[index]"
          class="bet-details"
        >
          <div class="detail-row">
            <span class="detail-label">投注类型：</span>
            <span class="detail-value">{{
              getVotesTypeText(item.votes_type)
            }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">投注选项：</span>
            <span class="detail-value">{{ getVotes(item) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">投注结果：</span>
            <span
              class="detail-value"
              :class="getResultClass(item.prize_winner)"
            >
              {{ getResultText(item.prize_winner) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">投注时间：</span>
            <span class="detail-value">{{ item.created_at }}</span>
          </div>
        </div>
      </n-card>
    </n-collapse-item>
  </n-collapse>
</template>

<script setup lang="ts">
import { ChevronDown } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import { onMounted, reactive, ref } from 'vue';

import { fetchQuizVotesList, votesStation } from '@/api/quiz';
import { voteTypeMap } from '@/constant.ts';
import { voteType } from '@/interface.ts';
import { useUserStore } from '@/store/user';

// 定义本地投注记录类型接口
interface LocalBetItem {
  match?: {
    team1?: { team_name: string };
    team2?: { team_name: string };
  };
  vote_amount: number;
  odds: number;
  prize_winner: number;
  votes_type: number;
  created_at: string;
  vote_index?: number;
  handicap?: number;
}

defineProps({
  dateRange: {
    type: Array,
    default: null,
  },
});

const emit = defineEmits(['update:dateRange']);

const userStore = useUserStore();
const message = useMessage();

// 本地今日投注数据
const localTodayData = reactive({
  title: '今日',
  totalBets: 0,
  totalTurnover: 0,
  totalProfit: 0,
  list: [] as LocalBetItem[],
});

// 本地历史投注数据
const localHistoryData = reactive({
  title: '历史',
  totalBets: 0,
  totalTurnover: 0,
  totalProfit: 0,
  list: [] as LocalBetItem[],
});

// 展开/收起状态
const todayToggleStates = ref<boolean[]>([]);
const historyToggleStates = ref<boolean[]>([]);

// 获取比赛名称
const getMatchName = (item: LocalBetItem) => {
  return item.match?.team1?.team_name && item.match?.team2?.team_name
    ? `${item.match.team1?.team_name} VS ${item.match.team2?.team_name}`
    : '未知比赛';
};

// 获取投注类型文本
const getVotesTypeText = (type: number) => {
  return voteTypeMap[type] || '未知类型';
};

// 获取投注选项
const getVotes = (item: LocalBetItem) => {
  switch (item.votes_type) {
    case voteType.letBall:
    case voteType.bureauLetBall:
      const voteTeamName =
        item.vote_index == 1
          ? item.match?.team1?.team_name || '未知队伍'
          : item.match?.team2?.team_name || '未知队伍';
      if (!item.handicap || item.handicap == 0) {
        return `${voteTeamName} ${item.handicap}`;
      } else {
        return voteTeamName;
      }
    case voteType.winLoss:
    case voteType.oddPurchase:
    case voteType.overGameLetBall:
      return item.vote_index == 1
        ? item.match?.team1?.team_name || '未知队伍'
        : item.match?.team2?.team_name || '未知队伍';
    case voteType.gameNumber:
      const str = item.vote_index == 1 ? '大' : '小';
      return `${str} ${item.handicap}`;
    default:
      return null;
  }
};

// 获取结果样式类
const getResultClass = (result: number) => {
  if (result === 1) return 'win';
  if (result === 0) return 'lose';
  return '';
};

// 获取结果文本
const getResultText = (result: number) => {
  if (result === 1) return '赢';
  if (result === 0) return '输';
  return '未结算';
};

// 切换展开/收起状态
const toggleShow = (index: number, type: 'today' | 'history') => {
  if (type === 'today') {
    todayToggleStates.value[index] = !todayToggleStates.value[index];
  } else {
    historyToggleStates.value[index] = !historyToggleStates.value[index];
  }
};

// 设置统计数据
const setTotalData = (
  type: 'today' | 'history',
  data: {
    total_count?: number;
    total_amount?: number;
    total_profit?: number;
  }
) => {
  if (type === 'today') {
    localTodayData.totalBets = data.total_count || 0;
    localTodayData.totalTurnover = data.total_amount || 0;
    localTodayData.totalProfit = data.total_profit || 0;
    // 初始化展开状态
    todayToggleStates.value = new Array(localTodayData.totalBets).fill(false);
  } else {
    localHistoryData.totalBets = data.total_count || 0;
    localHistoryData.totalTurnover = data.total_amount || 0;
    localHistoryData.totalProfit = data.total_profit || 0;
    // 初始化展开状态
    historyToggleStates.value = new Array(localHistoryData.totalBets).fill(
      false
    );
  }
};

// 获取今日投注
const fetchTodayBets = (customRange?: [Date | null, Date | null]) => {
  if (userStore.userInfo) {
    let rangTimeStart, rangTimeEnd;

    if (customRange && customRange[0] && customRange[1]) {
      // 使用自定义时间范围
      rangTimeStart = customRange[0].getTime();
      rangTimeEnd = customRange[1].getTime();
    } else {
      // 使用默认今日时间范围
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      );
      rangTimeStart = startOfDay.getTime();
      rangTimeEnd = now.getTime();
    }
    fetchQuizVotesList({
      user_id: userStore?.userInfo.id,
      rangTimeStart,
      rangTimeEnd,
      rangTimeType: 'created_at',
    }).then((res) => {
      if (res.code == 200) {
        localTodayData.list = res.data.rows;
        // setTotalData('today', res.data);
      }
    });
    votesStation({
      rangTimeStart,
      rangTimeEnd,
    }).then((res) => {
      if (res.code == 200) {
        console.log('votesStation today', res);
        setTotalData('today', res.data);
      }
    });
  } else {
    message.error('请先登录');
  }
};

// 获取历史投注
const fetchHistoryBets = (customRange?: [Date | null, Date | null]) => {
  if (userStore.userInfo) {
    let rangTimeEnd;

    if (customRange && customRange[0] && customRange[1]) {
      // 使用自定义时间范围的结束时间
      rangTimeEnd = customRange[0].getTime();
    } else {
      // 使用默认历史时间范围
      const now = new Date();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      );
      rangTimeEnd = endOfDay.getTime();
    }
    fetchQuizVotesList({
      user_id: userStore?.userInfo.id,
      rangTimeEnd,
      rangTimeType: 'created_at',
    }).then((res) => {
      if (res.code == 200) {
        localHistoryData.list = res.data.rows;
        // setTotalData('history', res.data);
      }
    });
    votesStation({
      rangTimeEnd,
    }).then((res) => {
      if (res.code == 200) {
        console.log('votesStation history', res);
        setTotalData('history', res.data);
      }
    });
  } else {
    message.error('请先登录');
  }
};

// 获取所有本地投注数据
const fetchAllLocalData = () => {
  // 重置数据
  localTodayData.list = [];
  localTodayData.totalBets = 0;
  localTodayData.totalTurnover = 0;
  localTodayData.totalProfit = 0;

  localHistoryData.list = [];
  localHistoryData.totalBets = 0;
  localHistoryData.totalTurnover = 0;
  localHistoryData.totalProfit = 0;

  fetchTodayBets();
  fetchHistoryBets();
};

// 暴露方法给父组件
defineExpose({
  fetchAllLocalData,
  fetchTodayBets,
  fetchHistoryBets,
});

// 组件挂载时获取数据
onMounted(() => {
  if (userStore.userInfo) {
    fetchTodayBets();
    fetchHistoryBets();
  } else {
    userStore.getUserInfo().then(() => {
      fetchTodayBets();
      fetchHistoryBets();
    });
  }
});
</script>

<style lang="scss" scoped>
.bet-history-card {
  margin-bottom: 10px;
  background-color: #fff;
}

.bet-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.match-name {
  font-weight: 600;
  color: #333;
}

.toggle-button {
  margin-left: 10px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.arrow-icon.rotate {
  transform: rotate(180deg);
}

.bet-info {
  margin-bottom: 10px;
}

.statistic-value {
  font-size: 14px;
}

.bet-details {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
}

.detail-label {
  color: #666;
  margin-right: 10px;
  min-width: 80px;
}

.detail-value {
  color: #333;
  flex: 1;
}

.win {
  color: #00b300;
}

.lose {
  color: #ff0000;
}

.statistic-summary {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.empty-data {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>
