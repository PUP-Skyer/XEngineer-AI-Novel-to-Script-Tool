<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';

interface Script {
  id: string;
  title: string;
  sourceNovel: string;
  author: string;
  playerCount: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  sceneCount: number;
  createdAt: string;
  updatedAt: string;
}

const router = useRouter();

// 列表数据
const scriptList = ref<Script[]>([]);
const total = ref(0);
const loading = ref(false);

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  status: '',
});

const searchForm = reactive({
  keyword: '',
  status: '',
});

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已归档', value: 'archived' },
];

// 模拟数据
function loadData(): void {
  loading.value = true;
  setTimeout(() => {
    scriptList.value = [
      {
        id: '1',
        title: '三体: 黑暗森林',
        sourceNovel: '三体',
        author: 'AI 生成',
        playerCount: '4-8人',
        difficulty: 'hard',
        status: 'published',
        sceneCount: 24,
        createdAt: '2024-02-01T08:00:00Z',
        updatedAt: '2024-03-15T10:00:00Z',
      },
      {
        id: '2',
        title: '活着: 岁月',
        sourceNovel: '活着',
        author: 'AI 生成',
        playerCount: '3-6人',
        difficulty: 'medium',
        status: 'published',
        sceneCount: 16,
        createdAt: '2024-02-15T08:00:00Z',
        updatedAt: '2024-03-10T10:00:00Z',
      },
      {
        id: '3',
        title: '天龙八部: 江湖',
        sourceNovel: '天龙八部',
        author: 'AI 生成',
        playerCount: '5-10人',
        difficulty: 'hard',
        status: 'draft',
        sceneCount: 32,
        createdAt: '2024-03-01T08:00:00Z',
        updatedAt: '2024-03-18T10:00:00Z',
      },
      {
        id: '4',
        title: '围城: 选择',
        sourceNovel: '围城',
        author: 'AI 生成',
        playerCount: '4-6人',
        difficulty: 'easy',
        status: 'archived',
        sceneCount: 12,
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-02-28T10:00:00Z',
      },
    ];
    total.value = 4;
    loading.value = false;
  }, 500);
}

// 状态映射
function getStatusType(status: string): 'success' | 'info' | 'warning' | 'danger' {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    published: 'success',
    draft: 'warning',
    archived: 'info',
  };
  return map[status] || 'info';
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档',
  };
  return map[status] || status;
}

// 难度映射
function getDifficultyType(d: string): '' | 'success' | 'warning' | 'danger' {
  const map: Record<string, '' | 'success' | 'warning' | 'danger'> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger',
  };
  return map[d] || '';
}

function getDifficultyLabel(d: string): string {
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };
  return map[d] || d;
}

// 搜索
function handleSearch(): void {
  queryParams.page = 1;
  queryParams.keyword = searchForm.keyword;
  queryParams.status = searchForm.status;
  loadData();
}

// 重置
function handleReset(): void {
  searchForm.keyword = '';
  searchForm.status = '';
  queryParams.page = 1;
  loadData();
}

// 查看详情
function handleView(row: { id: string }): void {
  router.push(`/scripts/${row.id}`);
}

// 删除
async function handleDelete(row: { id: string; title: string }): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除剧本「${row.title}」？此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'error' },
    );
    scriptList.value = scriptList.value.filter((s) => s.id !== row.id);
    total.value--;
    ElMessage.success('删除成功');
  } catch {
    // 用户取消
  }
}

// 页码变化
function handlePageChange(page: number): void {
  queryParams.page = page;
  loadData();
}

// 每页条数变化
function handleSizeChange(size: number): void {
  queryParams.pageSize = size;
  queryParams.page = 1;
  loadData();
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="script-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">剧本管理</h2>
    </div>

    <!-- 搜索栏 -->
    <div class="card-container search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索剧本名/来源小说"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" style="width: 140px">
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="card-container">
      <el-table v-loading="loading" :data="scriptList" stripe border>
        <el-table-column prop="title" label="剧本名称" min-width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="sourceNovel" label="来源小说" min-width="120" />
        <el-table-column prop="playerCount" label="人数" width="90" />
        <el-table-column prop="difficulty" label="难度" width="80">
          <template #default="{ row }">
            <el-tag :type="getDifficultyType(row.difficulty)" size="small">
              {{ getDifficultyLabel(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sceneCount" label="场景数" width="80" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="170">
          <template #default="{ row }">
            {{ new Date(row.updatedAt).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="140">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.script-list-page {
  .search-section {
    margin-bottom: 16px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
}
</style>
