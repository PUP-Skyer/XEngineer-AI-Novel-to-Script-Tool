<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useNovelStore } from '@/stores/novel';

const route = useRoute();
const router = useRouter();
const novelStore = useNovelStore();

const novelId = route.params.id as string;

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

function formatWordCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万';
  }
  return count.toString();
}

// 返回列表
function goBack(): void {
  router.push('/novels');
}

// 编辑
function handleEdit(): void {
  router.push(`/novels/${novelId}/edit`);
}

// 审核通过
async function handleApprove(): Promise<void> {
  try {
    await ElMessageBox.confirm('确认通过该小说的审核？', '审核确认', {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success',
    });
    await novelStore.reviewNovel(novelId, 'approved');
  } catch {
    // 用户取消
  }
}

// 驳回
async function handleReject(): Promise<void> {
  try {
    await ElMessageBox.confirm('确认驳回该小说？', '驳回确认', {
      confirmButtonText: '驳回',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await novelStore.reviewNovel(novelId, 'rejected');
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  novelStore.fetchNovelDetail(novelId);
});
</script>

<template>
  <div v-loading="novelStore.detailLoading" class="novel-detail-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-button icon="ArrowLeft" @click="goBack">返回</el-button>
        <h2 class="page-title">小说详情</h2>
      </div>
      <div class="header-actions" v-if="novelStore.currentNovel">
        <el-button type="primary" icon="Edit" @click="handleEdit">编辑</el-button>
        <el-button
          v-if="novelStore.currentNovel.status === 'pending'"
          type="success"
          icon="Check"
          @click="handleApprove"
        >
          审核通过
        </el-button>
        <el-button
          v-if="novelStore.currentNovel.status === 'pending'"
          type="danger"
          icon="Close"
          @click="handleReject"
        >
          驳回
        </el-button>
      </div>
    </div>

    <template v-if="novelStore.currentNovel">
      <!-- 基本信息卡片 -->
      <div class="card-container info-card">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="书名">
            {{ novelStore.currentNovel.title }}
          </el-descriptions-item>
          <el-descriptions-item label="作者">
            {{ novelStore.currentNovel.author }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ novelStore.currentNovel.genre }}
          </el-descriptions-item>
          <el-descriptions-item label="字数">
            {{ formatWordCount(novelStore.currentNovel.wordCount) }}
          </el-descriptions-item>
          <el-descriptions-item label="章节数">
            {{ novelStore.currentNovel.chapterCount }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(novelStore.currentNovel.status)" size="small">
              {{ getStatusLabel(novelStore.currentNovel.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ new Date(novelStore.currentNovel.createdAt).toLocaleString('zh-CN') }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ new Date(novelStore.currentNovel.updatedAt).toLocaleString('zh-CN') }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 简介 -->
      <div class="card-container">
        <h3 class="section-title">小说简介</h3>
        <p class="synopsis-text">{{ novelStore.currentNovel.synopsis }}</p>
      </div>
    </template>

    <!-- 空状态 -->
    <el-empty v-else-if="!novelStore.detailLoading" description="未找到该小说" />
  </div>
</template>

<style lang="scss" scoped>
.novel-detail-page {
  .page-header {
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .info-card {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    margin: 0 0 16px 0;
  }

  .synopsis-text {
    font-size: 14px;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.65);
    margin: 0;
  }

  :deep(.el-descriptions__label) {
    color: rgba(255, 255, 255, 0.45);
    background-color: #252740;
  }

  :deep(.el-descriptions__content) {
    background-color: #1e2030;
  }
}
</style>
