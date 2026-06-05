<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useNovelStore } from '@/stores/novel';

const router = useRouter();
const novelStore = useNovelStore();

// 搜索和筛选
const searchForm = reactive({
  keyword: '',
  status: '',
  genre: '',
});

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
  { label: '处理中', value: 'processing' },
];

const genreOptions = [
  { label: '全部类型', value: '' },
  { label: '科幻', value: '科幻' },
  { label: '武侠', value: '武侠' },
  { label: '现实', value: '现实' },
  { label: '悬疑', value: '悬疑' },
  { label: '言情', value: '言情' },
];

// 状态映射
function getStatusType(status: string): 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    approved: 'success',
    pending: 'warning',
    processing: 'info',
    rejected: 'danger',
  };
  return map[status] || 'info';
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    approved: '已通过',
    pending: '待审核',
    processing: '处理中',
    rejected: '已驳回',
  };
  return map[status] || status;
}

// 格式化字数
function formatWordCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万';
  }
  return count.toString();
}

// 搜索
function handleSearch(): void {
  novelStore.queryParams.page = 1;
  novelStore.queryParams.keyword = searchForm.keyword;
  novelStore.queryParams.status = searchForm.status;
  novelStore.queryParams.genre = searchForm.genre;
  novelStore.fetchNovels();
}

// 重置搜索
function handleReset(): void {
  searchForm.keyword = '';
  searchForm.status = '';
  searchForm.genre = '';
  novelStore.resetQuery();
  novelStore.fetchNovels();
}

// 页码变化
function handlePageChange(page: number): void {
  novelStore.queryParams.page = page;
  novelStore.fetchNovels();
}

// 每页条数变化
function handleSizeChange(size: number): void {
  novelStore.queryParams.pageSize = size;
  novelStore.queryParams.page = 1;
  novelStore.fetchNovels();
}

// 查看详情
function handleView(row: { id: string }): void {
  router.push(`/novels/${row.id}`);
}

// 编辑
function handleEdit(row: { id: string }): void {
  router.push(`/novels/${row.id}/edit`);
}

// 审核通过
async function handleApprove(row: { id: string; title: string }): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认通过小说「${row.title}」的审核？`,
      '审核确认',
      { confirmButtonText: '通过', cancelButtonText: '取消', type: 'success' },
    );
    await novelStore.reviewNovel(row.id, 'approved');
  } catch {
    // 用户取消
  }
}

// 驳回
async function handleReject(row: { id: string; title: string }): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认驳回小说「${row.title}」？`,
      '驳回确认',
      { confirmButtonText: '驳回', cancelButtonText: '取消', type: 'warning' },
    );
    await novelStore.reviewNovel(row.id, 'rejected');
  } catch {
    // 用户取消
  }
}

// 删除
async function handleDelete(row: { id: string; title: string }): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除小说「${row.title}」？此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'error' },
    );
    await novelStore.deleteNovel(row.id);
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  novelStore.fetchNovels();
});
</script>

<template>
  <div class="novel-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">小说管理</h2>
      <el-button type="primary" icon="Plus">添加小说</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="card-container search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索书名/作者"
            clearable
            style="width: 200px"
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
        <el-form-item label="类型">
          <el-select v-model="searchForm.genre" placeholder="全部类型" style="width: 140px">
            <el-option
              v-for="option in genreOptions"
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
      <el-table
        v-loading="novelStore.loading"
        :data="novelStore.novelList"
        stripe
        border
      >
        <el-table-column prop="title" label="书名" min-width="160">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="100" />
        <el-table-column prop="genre" label="类型" width="80" />
        <el-table-column prop="wordCount" label="字数" width="100">
          <template #default="{ row }">
            {{ formatWordCount(row.wordCount) }}
          </template>
        </el-table-column>
        <el-table-column prop="chapterCount" label="章节数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="240">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              link
              size="small"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              link
              size="small"
              @click="handleReject(row)"
            >
              驳回
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="novelStore.queryParams.page"
          v-model:page-size="novelStore.queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="novelStore.total"
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
.novel-list-page {
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
