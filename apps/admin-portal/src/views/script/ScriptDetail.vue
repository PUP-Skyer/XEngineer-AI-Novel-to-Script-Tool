<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const scriptId = route.params.id as string;

interface ScriptDetail {
  id: string;
  title: string;
  sourceNovel: string;
  playerCount: string;
  difficulty: string;
  status: string;
  synopsis: string;
  scenes: Array<{
    id: string;
    name: string;
    description: string;
    choices: number;
  }>;
  yamlContent: string;
}

const script = ref<ScriptDetail | null>(null);
const loading = ref(true);
const activeTab = ref('overview');

// 模拟数据加载
function loadData(): void {
  loading.value = true;
  setTimeout(() => {
    script.value = {
      id: scriptId,
      title: '三体: 黑暗森林',
      sourceNovel: '三体',
      playerCount: '4-8人',
      difficulty: 'hard',
      status: 'published',
      synopsis:
        '基于刘慈欣《三体》系列改编的剧本杀，玩家将扮演不同的角色，在三体文明入侵地球的背景下展开推理和对抗。',
      scenes: [
        {
          id: '1',
          name: '红岸基地',
          description: '玩家来到红岸基地，揭开叶文洁的秘密',
          choices: 3,
        },
        {
          id: '2',
          name: 'ETO 会议',
          description: '玩家发现ETO组织的阴谋',
          choices: 4,
        },
        {
          id: '3',
          name: '面壁计划',
          description: '玩家需要选择面壁者并揭露其真实计划',
          choices: 5,
        },
        {
          id: '4',
          name: '黑暗森林',
          description: '最终对决，决定人类的命运',
          choices: 6,
        },
      ],
      yamlContent: `# 剧本: 三体: 黑暗森林
meta:
  title: 三体: 黑暗森林
  source_novel: 三体
  player_count: "4-8"
  difficulty: hard
  author: AI Generated

characters:
  - name: 叶文洁
    role: 红岸基地科学家
    secret: 与三体文明建立了联系
  - name: 罗辑
    role: 天文学家
    secret: 掌握了黑暗森林法则
  - name: 章北海
    role: 军人
    secret: 一直在执行逃亡计划
  - name: 伊文斯
    role: ETO 组织领袖
    secret: 试图帮助三体文明入侵

scenes:
  - id: scene_001
    name: 红岸基地
    description: |
      1969年，玩家来到红岸基地...
    choices:
      - id: choice_001
        text: 调查叶文洁的工作日志
        effects:
          - unlock: scene_002
          - knowledge: +2
      - id: choice_002
        text: 搜索基地的秘密设备
        effects:
          - unlock: scene_003
          - risk: 30`,
    };
    loading.value = false;
  }, 600);
}

// 返回列表
function goBack(): void {
  router.push('/scripts');
}

// 复制 YAML 内容
function handleCopy(): void {
  if (script.value?.yamlContent) {
    navigator.clipboard.writeText(script.value.yamlContent).then(() => {
      ElMessage.success('已复制到剪贴板');
    });
  }
}

// 下载 YAML
function handleDownload(): void {
  if (!script.value?.yamlContent) return;
  const blob = new Blob([script.value.yamlContent], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${script.value.title}.yaml`;
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div v-loading="loading" class="script-detail-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-button icon="ArrowLeft" @click="goBack">返回</el-button>
        <h2 class="page-title">剧本详情</h2>
      </div>
      <div class="header-actions" v-if="script">
        <el-button icon="Download" @click="handleDownload">下载 YAML</el-button>
      </div>
    </div>

    <template v-if="script">
      <!-- Tab 切换 -->
      <el-tabs v-model="activeTab" class="detail-tabs">
        <!-- 概览 Tab -->
        <el-tab-pane label="概览" name="overview">
          <!-- 基本信息 -->
          <div class="card-container">
            <h3 class="section-title">基本信息</h3>
            <el-descriptions :column="3" border>
              <el-descriptions-item label="剧本名称">
                {{ script.title }}
              </el-descriptions-item>
              <el-descriptions-item label="来源小说">
                {{ script.sourceNovel }}
              </el-descriptions-item>
              <el-descriptions-item label="玩家人数">
                {{ script.playerCount }}
              </el-descriptions-item>
              <el-descriptions-item label="难度">
                {{ script.difficulty === 'easy' ? '简单' : script.difficulty === 'medium' ? '中等' : '困难' }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                {{ script.status === 'published' ? '已发布' : script.status === 'draft' ? '草稿' : '已归档' }}
              </el-descriptions-item>
              <el-descriptions-item label="场景数">
                {{ script.scenes.length }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 简介 -->
          <div class="card-container">
            <h3 class="section-title">剧本简介</h3>
            <p class="synopsis-text">{{ script.synopsis }}</p>
          </div>

          <!-- 场景列表 -->
          <div class="card-container">
            <h3 class="section-title">场景列表</h3>
            <el-timeline>
              <el-timeline-item
                v-for="scene in script.scenes"
                :key="scene.id"
                :timestamp="`选择分支: ${scene.choices}个`"
                placement="top"
              >
                <el-card shadow="never" class="scene-card">
                  <h4 class="scene-name">{{ scene.name }}</h4>
                  <p class="scene-desc">{{ scene.description }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>

        <!-- YAML 内容 Tab -->
        <el-tab-pane label="YAML 源码" name="yaml">
          <div class="card-container">
            <div class="yaml-header">
              <h3 class="section-title">YAML 配置内容</h3>
              <el-button size="small" icon="CopyDocument" @click="handleCopy">复制</el-button>
            </div>
            <pre class="yaml-content"><code>{{ script.yamlContent }}</code></pre>
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>

    <el-empty v-else-if="!loading" description="未找到该剧本" />
  </div>
</template>

<style lang="scss" scoped>
.script-detail-page {
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

  .detail-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }
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

  .card-container {
    margin-bottom: 16px;
  }

  // 场景卡片
  .scene-card {
    background-color: #252740;
    border-color: rgba(255, 255, 255, 0.06);

    .scene-name {
      font-size: 15px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
      margin: 0 0 8px 0;
    }

    .scene-desc {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.45);
      margin: 0;
    }
  }

  // YAML 内容
  .yaml-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .section-title {
      margin-bottom: 0;
    }
  }

  .yaml-content {
    background-color: #0d0e18;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    padding: 20px;
    overflow-x: auto;
    font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.7);
    white-space: pre;
    margin: 16px 0 0 0;
  }

  :deep(.el-descriptions__label) {
    color: rgba(255, 255, 255, 0.45);
    background-color: #252740;
  }

  :deep(.el-descriptions__content) {
    background-color: #1e2030;
  }

  :deep(.el-timeline-item__timestamp) {
    color: rgba(255, 255, 255, 0.45);
  }
}
</style>
