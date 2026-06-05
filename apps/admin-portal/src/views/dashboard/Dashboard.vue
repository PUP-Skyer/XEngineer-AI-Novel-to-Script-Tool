<script setup lang="ts">
import { ref, onMounted } from 'vue';
import StatsCard from '@/components/StatsCard.vue';

// 统计数据
const stats = ref({
  userCount: 0,
  novelCount: 0,
  scriptCount: 0,
  gameSessions: 0,
});

const statsLoading = ref(true);

// 最近小说列表
const recentNovels = ref([
  { id: '1', title: '三体', author: '刘慈欣', status: 'approved', createdAt: '2024-01-15' },
  { id: '2', title: '活着', author: '余华', status: 'approved', createdAt: '2024-02-10' },
  { id: '3', title: '天龙八部', author: '金庸', status: 'pending', createdAt: '2024-03-05' },
  { id: '4', title: '围城', author: '钱钟书', status: 'processing', createdAt: '2024-03-10' },
  { id: '5', title: '白鹿原', author: '陈忠实', status: 'approved', createdAt: '2024-03-15' },
]);

// 最近游戏记录
const recentGames = ref([
  { id: '1', title: '三体: 黑暗森林', players: 6, status: 'completed', date: '2024-03-20' },
  { id: '2', title: '活着: 岁月', players: 4, status: 'completed', date: '2024-03-19' },
  { id: '3', title: '天龙八部: 江湖', players: 8, status: 'playing', date: '2024-03-20' },
  { id: '4', title: '围城: 选择', players: 5, status: 'waiting', date: '2024-03-21' },
]);

const novelsLoading = ref(true);
const gamesLoading = ref(true);

// 状态标签映射
function getStatusType(status: string): 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    approved: 'success',
    pending: 'warning',
    processing: 'info',
    rejected: 'danger',
    completed: 'success',
    playing: 'warning',
    waiting: 'info',
  };
  return map[status] || 'info';
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    approved: '已通过',
    pending: '待审核',
    processing: '处理中',
    rejected: '已驳回',
    completed: '已结束',
    playing: '进行中',
    waiting: '等待中',
  };
  return map[status] || status;
}

onMounted(async () => {
  // 模拟数据加载
  setTimeout(() => {
    stats.value = {
      userCount: 12580,
      novelCount: 346,
      scriptCount: 892,
      gameSessions: 5673,
    };
    statsLoading.value = false;
  }, 500);

  setTimeout(() => {
    novelsLoading.value = false;
  }, 600);

  setTimeout(() => {
    gamesLoading.value = false;
  }, 700);
});
</script>

<template>
  <div class="dashboard-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">仪表盘</h2>
      <span class="page-date">{{ new Date().toLocaleDateString('zh-CN') }}</span>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <StatsCard
          title="用户总数"
          :value="stats.userCount"
          icon="User"
          color="#409EFF"
          suffix="人"
          :loading="statsLoading"
          trend="up"
          trend-value="较上周 +12%"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <StatsCard
          title="小说总数"
          :value="stats.novelCount"
          icon="Reading"
          color="#67C23A"
          suffix="部"
          :loading="statsLoading"
          trend="up"
          trend-value="较上周 +5"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <StatsCard
          title="剧本总数"
          :value="stats.scriptCount"
          icon="Document"
          color="#E6A23C"
          suffix="个"
          :loading="statsLoading"
          trend="up"
          trend-value="较上周 +18"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <StatsCard
          title="游戏场次"
          :value="stats.gameSessions"
          icon="Position"
          color="#F56C6C"
          suffix="场"
          :loading="statsLoading"
          trend="up"
          trend-value="较上周 +156"
        />
      </el-col>
    </el-row>

    <!-- 内容区域 -->
    <el-row :gutter="20">
      <!-- 最近小说 -->
      <el-col :xs="24" :lg="12">
        <div class="card-container">
          <div class="card-header">
            <h3 class="card-title">最近小说</h3>
            <el-button type="primary" link @click="$router.push('/novels')">
              查看全部
            </el-button>
          </div>
          <el-table
            v-loading="novelsLoading"
            :data="recentNovels"
            class="content-table"
            size="small"
          >
            <el-table-column prop="title" label="书名" min-width="120" />
            <el-table-column prop="author" label="作者" min-width="80" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="日期" width="110" />
          </el-table>
        </div>
      </el-col>

      <!-- 最近游戏 -->
      <el-col :xs="24" :lg="12">
        <div class="card-container">
          <div class="card-header">
            <h3 class="card-title">最近游戏记录</h3>
            <el-button type="primary" link>
              查看全部
            </el-button>
          </div>
          <el-table
            v-loading="gamesLoading"
            :data="recentGames"
            class="content-table"
            size="small"
          >
            <el-table-column prop="title" label="游戏名称" min-width="140" />
            <el-table-column prop="players" label="玩家数" width="80" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="日期" width="110" />
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  .page-date {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.45);
  }

  .stats-row {
    margin-bottom: 20px;

    .el-col {
      margin-bottom: 12px;
    }
  }
}

.card-container {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
      margin: 0;
    }
  }
}

.content-table {
  width: 100%;
}
</style>
