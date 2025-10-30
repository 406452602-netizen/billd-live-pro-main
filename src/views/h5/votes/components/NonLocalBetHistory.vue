<template>
  <!-- 游戏类型筛选标签 -->
  <div class="game-filter-tags">
    <div class="game-filter-tags">
      <!-- "全部"标签 -->
      <n-tag
        type="primary"
        :class="{ 'n-tag--checked': selectedGameTypes.includes('all') }"
        @click="handleTagClick('all')"
      >
        全部
      </n-tag>

      <!-- 游戏类型标签 -->
      <n-tag
        v-for="gameType in gameTypes"
        :key="gameType.game_id"
        type="primary"
        :class="{
          'n-tag--checked': selectedGameTypes.includes(gameType.game_id),
        }"
        @click="handleTagClick(gameType.game_id)"
      >
        {{ gameType.game_name }}
      </n-tag>
    </div>
  </div>

  <div
    v-if="tabData.all.loading"
    class="loading"
  >
    加载中...
  </div>
  <div v-else>
    <n-collapse :default-expanded-names="['2', '3']">
      <!-- 今日记录 -->
      <n-collapse-item
        name="2"
        :title="`今日记录(${filteredTodayStats.totalBets}注)`"
      >
        <div
          v-if="filteredTodayList.length === 0"
          class="empty-data"
        >
          暂无非本地投注记录
        </div>
        <div
          v-else
          class="non-local-bet-container"
        >
          <!-- 投注记录列表 -->
          <div
            v-for="(item, index) in filteredTodayList"
            :key="index"
            class="non-local-bet"
          >
            <span class="game-name">{{ item.game_name }}</span>
            <span class="created-time">{{ item.created_at }}</span>
            <n-button
              size="small"
              text
              class="toggle-button"
              @click="toggleNonLocalItemShow(index, 'all', 'today')"
            >
              <n-icon
                :class="
                  getTodayToggleState(index)
                    ? 'arrow-icon rotate'
                    : 'arrow-icon'
                "
              >
                <ChevronDown />
              </n-icon>
            </n-button>

            <div
              v-if="getTodayToggleState(index)"
              class="non-local-bet-content"
            >
              <n-grid
                cols="2"
                :col-gap="10"
                :row-gap="10"
              >
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>投注编号</label>
                    <div class="statistic-value">{{ item.vote_id }}</div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>投注金额</label>
                    <div class="statistic-value">{{ item.vote_amount }}</div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>消费时间</label>
                    <div class="statistic-value">
                      {{ item.consumption_time }}
                    </div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>结算时间</label>
                    <div class="statistic-value">
                      {{ item.settlement_time }}
                    </div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>结算金额</label>
                    <div class="statistic-value">{{ item.result_amount }}</div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>净利润</label>
                    <div
                      class="statistic-value"
                      :class="
                        item.net_profit_amount && item.net_profit_amount >= 0
                          ? 'win'
                          : 'lose'
                      "
                    >
                      {{ item.net_profit_amount?.toFixed(2) || '-' }}
                    </div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>投注信息</label>
                    <div
                      class="statistic-value"
                      style="text-align: left; word-break: break-all"
                    >
                      {{ item.result || '-' }}
                    </div>
                  </div>
                </n-grid-item>
              </n-grid>
            </div>
          </div>

          <div class="statistic-summary">
            <n-grid
              cols="3"
              :col-gap="10"
            >
              <n-grid-item>
                <n-statistic
                  :value="filteredTodayStats.totalBets"
                  class="statistic-value"
                  label="总投注注数"
                />
              </n-grid-item>
              <n-grid-item>
                <n-statistic
                  :value="filteredTodayStats.totalTurnover"
                  class="statistic-value"
                  label="总投注金额"
                />
              </n-grid-item>
              <n-grid-item>
                <n-statistic
                  :value="filteredTodayStats.totalProfit"
                  class="statistic-value"
                  :class="filteredTodayStats.totalProfit >= 0 ? 'win' : 'lose'"
                  label="总净利润"
                />
              </n-grid-item>
            </n-grid>
          </div>
        </div>
      </n-collapse-item>

      <!-- 历史记录 -->
      <n-collapse-item
        name="3"
        :title="`历史记录(${filteredHistoryStats.totalBets}注)`"
      >
        <div
          v-if="filteredHistoryList.length === 0"
          class="empty-data"
        >
          暂无非本地投注记录
        </div>
        <div
          v-else
          class="non-local-bet-container"
        >
          <!-- 投注记录列表 -->
          <div
            v-for="(item, index) in filteredHistoryList"
            :key="index"
            class="non-local-bet"
          >
            <span class="game-name">{{ item.game_name }}</span>
            <span class="created-time">{{ item.created_at }}</span>
            <n-button
              size="small"
              text
              class="toggle-button"
              @click="toggleNonLocalItemShow(index, 'all', 'history')"
            >
              <n-icon
                :class="
                  getHistoryToggleState(index)
                    ? 'arrow-icon rotate'
                    : 'arrow-icon'
                "
              >
                <ChevronDown />
              </n-icon>
            </n-button>

            <div
              v-if="getHistoryToggleState(index)"
              class="non-local-bet-content"
            >
              <n-grid
                cols="2"
                :col-gap="10"
                :row-gap="10"
              >
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>投注编号</label>
                    <div class="statistic-value">{{ item.vote_id }}</div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>投注金额</label>
                    <div class="statistic-value">{{ item.vote_amount }}</div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>消费时间</label>
                    <div class="statistic-value">
                      {{ item.consumption_time }}
                    </div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>结算时间</label>
                    <div class="statistic-value">
                      {{ item.settlement_time }}
                    </div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>结算金额</label>
                    <div class="statistic-value">{{ item.result_amount }}</div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>净利润</label>
                    <div
                      class="statistic-value"
                      :class="
                        item.net_profit_amount && item.net_profit_amount >= 0
                          ? 'win'
                          : 'lose'
                      "
                    >
                      {{ item.net_profit_amount?.toFixed(2) || '-' }}
                    </div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="non-local-bet-item">
                    <label>投注信息</label>
                    <div
                      class="statistic-value"
                      style="text-align: left; word-break: break-all"
                    >
                      {{ item.result || '-' }}
                    </div>
                  </div>
                </n-grid-item>
              </n-grid>
            </div>
          </div>

          <div class="statistic-summary">
            <n-grid
              cols="3"
              :col-gap="10"
            >
              <n-grid-item>
                <n-statistic
                  :value="filteredHistoryStats.totalBets"
                  class="statistic-value"
                  label="总投注注数"
                />
              </n-grid-item>
              <n-grid-item>
                <n-statistic
                  :value="filteredHistoryStats.totalTurnover"
                  class="statistic-value"
                  label="总投注金额"
                />
              </n-grid-item>
              <n-grid-item>
                <n-statistic
                  :value="filteredHistoryStats.totalProfit"
                  class="statistic-value"
                  :class="
                    filteredHistoryStats.totalProfit >= 0 ? 'win' : 'lose'
                  "
                  label="总净利润"
                />
              </n-grid-item>
            </n-grid>
          </div>
        </div>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { getGameConsumptionList, getGamesNames } from '@/api/game.ts';
import { useUserStore } from '@/store/user';

// 定义非本地投注记录类型接口，基于game_consumption_record表结构
interface NonLocalBetItem {
  show: boolean;
  vote_id: string; // 对应game_order
  vote_amount: number; // 对应consumption_amount
  odds?: number; // 可能不存在此字段
  result_amount?: number; // 对应settlement_amount
  net_profit_amount?: number; // 结算金额减去消费金额
  result: string; // 对应result字段
  game_name: string;
  game_id: number; // 对应game_id，类型为number
  consumption_time: string; // 对应consumption_time
  settlement_time: string; // 对应settlement_time
  created_at: string;
}

// 定义游戏类型接口
interface GameType {
  game_id: string;
  game_name: string;
  game_logo?: string;
}

// 定义非本地标签页数据结构
interface NonLocalTabData {
  loading: boolean;
  totalBets: number;
  totalTurnover: number;
  totalProfit: number;
  list: NonLocalBetItem[];
  toggleStates: boolean[];
}

// 定义完整的标签页数据结构
interface FullTabData {
  [key: string]: {
    loading: boolean;
    today?: NonLocalTabData;
    history?: NonLocalTabData;
    list?: NonLocalBetItem[];
    totalBets?: number;
    totalTurnover?: number;
    totalProfit?: number;
    toggleStates?: boolean[];
  };
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

// 非本地各标签页数据
const tabData: FullTabData = reactive({
  all: {
    loading: false,
    today: {
      loading: false,
      totalBets: 0,
      totalTurnover: 0,
      totalProfit: 0,
      list: [] as NonLocalBetItem[],
      toggleStates: [],
    },
    history: {
      loading: false,
      totalBets: 0,
      totalTurnover: 0,
      totalProfit: 0,
      list: [] as NonLocalBetItem[],
      toggleStates: [],
    },
  },
});

// 游戏类型列表
const gameTypes = ref<GameType[]>([]);

// 选中的游戏类型game_id
const selectedGameTypes = ref<any[]>(['all']);

// 根据游戏类型过滤今日列表
const filteredTodayList = computed(() => {
  if (!tabData.all.today) return [];

  if (selectedGameTypes.value.includes('all')) {
    return tabData.all.today.list;
  }

  return tabData.all.today.list.filter((item) => {
    // 使用game_id作为查询条件
    return selectedGameTypes.value.includes(item.game_id);
  });
});

// 根据游戏类型过滤历史列表
const filteredHistoryList = computed(() => {
  if (!tabData.all.history) return [];

  if (selectedGameTypes.value.includes('all')) {
    return tabData.all.history.list;
  }

  return tabData.all.history.list.filter((item) => {
    // 使用game_id作为查询条件
    return selectedGameTypes.value.includes(item.game_id);
  });
});

// 计算过滤后的今日统计数据
const filteredTodayStats = computed(() => {
  if (!tabData.all.today) {
    return { totalBets: 0, totalTurnover: 0, totalProfit: 0 };
  }

  // 如果选中了'全部'，直接返回完整统计
  if (selectedGameTypes.value.includes('all')) {
    return {
      totalBets: tabData.all.today.totalBets,
      totalTurnover: tabData.all.today.totalTurnover,
      totalProfit: tabData.all.today.totalProfit,
    };
  }

  // 否则根据过滤后的列表重新计算统计数据
  const filteredList = filteredTodayList.value;
  return {
    totalBets: filteredList.length,
    totalTurnover: filteredList.reduce(
      (sum, item) => sum + item.vote_amount,
      0
    ),
    totalProfit: filteredList.reduce(
      (sum, item) => sum + Number(item.net_profit_amount),
      0
    ),
  };
});

// 计算过滤后的历史统计数据
const filteredHistoryStats = computed(() => {
  if (!tabData.all.history) {
    return { totalBets: 0, totalTurnover: 0, totalProfit: 0 };
  }

  // 如果选中了'全部'，直接返回完整统计
  if (selectedGameTypes.value.includes('all')) {
    return {
      totalBets: tabData.all.history.totalBets,
      totalTurnover: tabData.all.history.totalTurnover,
      totalProfit: tabData.all.history.totalProfit,
    };
  }

  // 否则根据过滤后的列表重新计算统计数据
  const filteredList = filteredHistoryList.value;
  return {
    totalBets: filteredList.length,
    totalTurnover: filteredList.reduce(
      (sum, item) => sum + item.vote_amount,
      0
    ),
    totalProfit: filteredList.reduce(
      (sum, item) => sum + Number(item.net_profit_amount),
      0
    ),
  };
});

// 处理标签点击事件
const handleTagClick = (gameId: string) => {
  if (gameId === 'all') {
    selectedGameTypes.value = ['all'];
  } else {
    // 移除'全部'标签
    selectedGameTypes.value = selectedGameTypes.value.filter(
      (id) => id !== 'all'
    );

    // 切换当前标签的选中状态
    const index = selectedGameTypes.value.indexOf(gameId);
    if (index === -1) {
      selectedGameTypes.value.push(gameId);
    } else {
      selectedGameTypes.value.splice(index, 1);
    }

    // 如果没有选中任何游戏类型，则默认选中'全部'
    if (selectedGameTypes.value.length === 0) {
      selectedGameTypes.value = ['all'];
    }
  }
};

// 获取今日展开状态
const getTodayToggleState = (index: number) => {
  if (!tabData.all.today || !tabData.all.today.toggleStates) return false;

  // 找到原始列表中对应的数据项的索引
  const filteredItem = filteredTodayList.value[index];
  const originalIndex = tabData.all.today.list.findIndex(
    (item) => item.vote_id === filteredItem.vote_id
  );

  return originalIndex !== -1 && tabData.all.today.toggleStates[originalIndex];
};

// 获取历史展开状态
const getHistoryToggleState = (index: number) => {
  if (!tabData.all.history || !tabData.all.history.toggleStates) return false;

  // 找到原始列表中对应的数据项的索引
  const filteredItem = filteredHistoryList.value[index];
  const originalIndex = tabData.all.history.list.findIndex(
    (item) => item.vote_id === filteredItem.vote_id
  );

  return (
    originalIndex !== -1 && tabData.all.history.toggleStates[originalIndex]
  );
};

// 更新模拟数据以包含游戏类型标识和game_id
const updateMockDataWithGameTypes = (mockData: any, _: boolean) => {
  // 在实际项目中，这部分应该由后端API直接提供
  // 这里我们模拟添加游戏类型标识和game_id
  const mockGameTypes: { id: string; prefix: string }[] = [
    { id: 'vboss', prefix: 'VBOSS-' },
    { id: 'tiger', prefix: 'Tiger-' },
    { id: 'game', prefix: 'Game-' },
    { id: 'default', prefix: '' },
  ];

  mockData.rows = mockData.rows.map((row: any, index: number) => {
    const randomIndex = index % mockGameTypes.length;
    const selectedType = mockGameTypes[randomIndex];
    return {
      ...row,
      game_name: selectedType.prefix + row.game_name,
      game_id: selectedType.id, // 添加game_id字段
    };
  });

  return mockData;
};

// 获取游戏类型列表
const loadGameTypes = async () => {
  try {
    const response = await getGamesNames();
    // 假设API返回的数据格式为{data: GameType[]}
    if (response && response.data) {
      gameTypes.value = response.data.rows;
    } else {
      // 如果API调用失败或没有返回数据，使用默认的模拟数据
      gameTypes.value = [
        { game_id: 'vboss', game_name: 'VBOSS' },
        { game_id: 'tiger', game_name: 'Tiger' },
        { game_id: 'game', game_name: 'Game' },
      ];
    }
  } catch (error) {
    console.error('获取游戏类型失败:', error);
    // 使用默认的模拟数据
    gameTypes.value = [
      { game_id: 'vboss', game_name: 'VBOSS' },
      { game_id: 'tiger', game_name: 'Tiger' },
      { game_id: 'game', game_name: 'Game' },
    ];
  }
};

// 获取非本地投注记录（通用函数）
const fetchNonLocalBets = (type: 'today' | 'history', customRange?: any) => {
  console.log(customRange);
  if (!userStore.userInfo) {
    message.error('请先登录');
    return;
  }

  if (tabData.all[type]) {
    tabData.all[type].loading = true;
  }

  // 构建API查询参数，包含game_id筛选条件
  const queryParams = {
    game_ids: selectedGameTypes.value.includes('all')
      ? []
      : selectedGameTypes.value,
    start_time: customRange?.[0]?.toISOString?.() || '',
    end_time: customRange?.[1]?.toISOString?.() || '',
  };

  console.log('查询参数:', queryParams);

  // 模拟API请求
  setTimeout(() => {
    let mockData;

    if (type === 'today') {
      mockData = {
        total_count: 8,
        total_amount: 4500,
        total_profit: 1500,
        rows: [
          {
            show: false,
            vote_id: 'NLB20231103008',
            vote_amount: 600,
            odds: 1.8,
            result_amount: 1080,
            net_profit_amount: 480,
            game_name: '扑克',
            created_at: '2023-11-03 22:15:00',
          },
        ],
      };
    } else if (type === 'history') {
      mockData = {
        total_count: 8,
        total_amount: 4200,
        total_profit: 1200,
        rows: [
          {
            show: false,
            vote_id: 'NLB20231102001',
            vote_amount: 600,
            odds: 1.85,
            result_amount: 1110,
            net_profit_amount: 510,
            game_name: '百家乐',
            created_at: '2023-11-02 19:30:00',
          },
        ],
      };
    }

    // 更新模拟数据以包含游戏类型标识
    if (mockData) {
      mockData = updateMockDataWithGameTypes(mockData, type === 'today');

      if (tabData.all[type]) {
        tabData.all[type]!.totalBets = mockData.total_count || 0;
        tabData.all[type]!.totalTurnover = mockData.total_amount || 0;
        tabData.all[type]!.totalProfit = mockData.total_profit || 0;
        tabData.all[type]!.list = mockData.rows;
        tabData.all[type]!.toggleStates = new Array(
          mockData.total_count || 0
        ).fill(false);
        tabData.all[type]!.loading = false;
      }
    }
  }, 800);
};

// 获取非本地投注今日数据
const fetchNonLocalTodayBets = (customRange?: [Date | null, Date | null]) => {
  fetchNonLocalBets('today', customRange);
};

// 获取非本地投注历史数据
const fetchNonLocalHistoryBets = (customRange?: [Date | null, Date | null]) => {
  fetchNonLocalBets('history', customRange);
};

// 获取所有非本地投注数据
const fetchAllNonLocalData = async () => {
  // 重置数据
  if (tabData.all.today) {
    tabData.all.today!.list = [];
    tabData.all.today!.totalBets = 0;
    tabData.all.today!.totalTurnover = 0;
    tabData.all.today!.totalProfit = 0;
  }

  if (tabData.all.history) {
    tabData.all.history!.list = [];
    tabData.all.history!.totalBets = 0;
    tabData.all.history!.totalTurnover = 0;
    tabData.all.history!.totalProfit = 0;
  }

  // 重置其他可能存在的数据结构
  Object.keys(tabData).forEach((key) => {
    if (key !== 'all') {
      tabData[key].list = [];
      tabData[key].totalBets = 0;
      tabData[key].totalTurnover = 0;
      tabData[key].totalProfit = 0;
    }
  });

  if (!userStore.userInfo) {
    message.error('请先登录');
    return;
  }

  try {
    // 设置加载状态
    tabData.all.loading = true;

    // 调用/gameTransactionRecord/gameConsumptionList接口
    const response = await getGameConsumptionList({
      user_id: userStore.userInfo.id,
      game_ids: selectedGameTypes.value.includes('all')
        ? []
        : selectedGameTypes.value,
      nowPage: 1,
      pageSize: 1000,
    });

    if (response.code === 200 && response.data && response.data.rows) {
      // 处理返回的数据并分配到today和history列表
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayRecords: NonLocalBetItem[] = [];
      const historyRecords: NonLocalBetItem[] = [];

      // 更新数据，根据game_consumption_record表结构映射字段
      response.data.rows.forEach((row: any) => {
        const itemDate = new Date(row.created_at);
        itemDate.setHours(0, 0, 0, 0);

        const betItem: NonLocalBetItem = {
          show: false,
          vote_id: row.game_order || `NLB${Date.now()}`,
          vote_amount: parseFloat(row.consumption_amount) || 0,
          result_amount: parseFloat(row.settlement_amount) || undefined,
          net_profit_amount:
            (parseFloat(row.settlement_amount) || 0) -
            (parseFloat(row.consumption_amount) || 0),
          // 根据settlement_amount是否存在判断是否开奖
          game_name: row.game.game_name || '未知游戏',
          game_id: parseInt(row.game_id) || 0,
          result: row.result || '-',
          consumption_time: row.consumption_time,
          settlement_time: row.settlement_time,
          created_at: row.created_at,
        };

        if (itemDate.getTime() === today.getTime()) {
          todayRecords.push(betItem);
        } else {
          historyRecords.push(betItem);
        }
      });

      // 更新今日数据
      if (tabData.all.today) {
        tabData.all.today!.list = todayRecords;
        tabData.all.today!.totalBets = todayRecords.length;
        tabData.all.today!.totalTurnover = todayRecords.reduce(
          (sum, item) => sum + item.vote_amount,
          0
        );
        tabData.all.today!.totalProfit = todayRecords.reduce(
          (sum, item) => sum + Number(item.net_profit_amount),
          0
        );
        tabData.all.today!.toggleStates = new Array(todayRecords.length).fill(
          false
        );
      }

      // 更新历史数据
      if (tabData.all.history) {
        tabData.all.history!.list = historyRecords;
        tabData.all.history!.totalBets = historyRecords.length;
        tabData.all.history!.totalTurnover = historyRecords.reduce(
          (sum, item) => sum + item.vote_amount,
          0
        );
        tabData.all.history!.totalProfit = historyRecords.reduce(
          (sum, item) => sum + Number(item.net_profit_amount),
          0
        );
        tabData.all.history!.toggleStates = new Array(
          historyRecords.length
        ).fill(false);
      }
    }
  } catch (error) {
    console.error('获取游戏消费记录失败:', error);
    message.error('获取游戏消费记录失败');
  } finally {
    tabData.all.loading = false;
  }
};

// 切换非本地投注项的展开/收起状态
const toggleNonLocalItemShow = (
  index: number,
  type: string,
  timeType: 'today' | 'history' | 'all'
) => {
  if (type === 'all' && (timeType === 'today' || timeType === 'history')) {
    if (tabData.all[timeType] && tabData.all[timeType]!.toggleStates) {
      // 获取过滤后的列表和对应的原始索引
      const filteredList =
        timeType === 'today'
          ? filteredTodayList.value
          : filteredHistoryList.value;
      const filteredItem = filteredList[index];
      const originalIndex = tabData.all[timeType]!.list.findIndex(
        (item) => item.vote_id === filteredItem.vote_id
      );

      if (originalIndex !== -1) {
        tabData.all[timeType]!.toggleStates[originalIndex] =
          !tabData.all[timeType]!.toggleStates[originalIndex];
      }
    }
  }
};

// 暴露方法给父组件
defineExpose({
  fetchAllNonLocalData,
  fetchNonLocalTodayBets,
  fetchNonLocalHistoryBets,
});

// 页面挂载时加载数据
onMounted(async () => {
  // 先加载游戏类型列表
  await loadGameTypes();

  if (userStore.userInfo) {
    // 加载所有数据
    await fetchAllNonLocalData();
  }
});

// 监听游戏类型选择的变化，重新加载数据
watch(
  selectedGameTypes,
  async () => {
    if (userStore.userInfo) {
      await fetchAllNonLocalData();
    }
  },
  { deep: true }
);
</script>

<style scoped>
.non-local-bet-item {
  margin-bottom: 10px;
}

.non-local-bet-item label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  display: block;
}

.non-local-bet-item .statistic-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.statistic-summary {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.statistic-value {
  font-size: 16px;
  font-weight: 600;
}

.win {
  color: #3c95ff;
}

.lose {
  color: #ff4d4f;
}

.empty-data {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.sub-tabs {
  margin-bottom: 20px;
}

.non-local-subtab-content {
  margin-top: 20px;
}

.non-local-bet-container {
  margin-top: 10px;
}

.non-local-bet {
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  position: relative;
}

.game-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.created-time {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.toggle-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.arrow-icon.rotate {
  transform: rotate(180deg);
}

.non-local-bet-content {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e8e8e8;
}

/* 游戏类型筛选标签样式 */
.game-filter-tags {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.game-filter-tags .n-tag {
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
}

.game-filter-tags .n-tag--checked {
  background-color: #3c95ff;
  color: white;
}
</style>
