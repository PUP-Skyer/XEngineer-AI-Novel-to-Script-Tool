<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

interface AiModel {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  apiKey: string;
  endpoint: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
  description: string;
  createdAt: string;
}

// 列表数据
const modelList = ref<AiModel[]>([]);
const loading = ref(false);

// 对话框控制
const dialogVisible = ref(false);
const dialogTitle = ref('添加模型');
const editingId = ref<string | null>(null);
const formRef = ref<FormInstance>();
const submitting = ref(false);

// 表单数据
const form = reactive({
  name: '',
  provider: '',
  modelId: '',
  apiKey: '',
  endpoint: '',
  maxTokens: 4096,
  temperature: 0.7,
  enabled: true,
  description: '',
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入模型名称', trigger: 'blur' },
    { max: 50, message: '名称最长 50 个字符', trigger: 'blur' },
  ],
  provider: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  modelId: [{ required: true, message: '请输入模型 ID', trigger: 'blur' }],
  apiKey: [{ required: true, message: '请输入 API Key', trigger: 'blur' }],
  endpoint: [{ required: true, message: '请输入 API 端点', trigger: 'blur' }],
  maxTokens: [
    { required: true, message: '请输入最大 Token 数', trigger: 'blur' },
  ],
  temperature: [
    { required: true, message: '请输入温度值', trigger: 'blur' },
  ],
};

const providerOptions = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: '百度文心一言', value: 'baidu' },
  { label: '阿里通义千问', value: 'alibaba' },
  { label: '自定义', value: 'custom' },
];

// 模拟数据
function loadData(): void {
  loading.value = true;
  setTimeout(() => {
    modelList.value = [
      {
        id: '1',
        name: 'GPT-4o',
        provider: 'openai',
        modelId: 'gpt-4o',
        apiKey: 'sk-****...****abc',
        endpoint: 'https://api.openai.com/v1',
        maxTokens: 8192,
        temperature: 0.7,
        enabled: true,
        description: 'OpenAI 最新多模态模型，适合复杂剧本生成',
        createdAt: '2024-01-15T08:00:00Z',
      },
      {
        id: '2',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        modelId: 'claude-3-5-sonnet-20241022',
        apiKey: 'sk-ant-****...****xyz',
        endpoint: 'https://api.anthropic.com/v1',
        maxTokens: 8192,
        temperature: 0.5,
        enabled: true,
        description: 'Anthropic 高性能模型，擅长文学创作',
        createdAt: '2024-02-10T08:00:00Z',
      },
      {
        id: '3',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        modelId: 'gpt-3.5-turbo',
        apiKey: 'sk-****...****def',
        endpoint: 'https://api.openai.com/v1',
        maxTokens: 4096,
        temperature: 0.8,
        enabled: false,
        description: '成本较低的模型，适合日常对话和简单任务',
        createdAt: '2024-01-01T08:00:00Z',
      },
    ];
    loading.value = false;
  }, 500);
}

// 供应商名称
function getProviderLabel(provider: string): string {
  const option = providerOptions.find((p) => p.value === provider);
  return option?.label || provider;
}

// 打开添加对话框
function handleAdd(): void {
  dialogTitle.value = '添加模型';
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
}

// 打开编辑对话框
function handleEdit(row: AiModel): void {
  dialogTitle.value = '编辑模型';
  editingId.value = row.id;
  Object.assign(form, {
    name: row.name,
    provider: row.provider,
    modelId: row.modelId,
    apiKey: row.apiKey,
    endpoint: row.endpoint,
    maxTokens: row.maxTokens,
    temperature: row.temperature,
    enabled: row.enabled,
    description: row.description,
  });
  dialogVisible.value = true;
}

// 保存
async function handleSave(): Promise<void> {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    submitting.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (editingId.value) {
        // 编辑
        const index = modelList.value.findIndex((m) => m.id === editingId.value);
        if (index !== -1) {
          modelList.value[index] = {
            ...modelList.value[index],
            ...form,
          };
        }
        ElMessage.success('保存成功');
      } else {
        // 新增
        modelList.value.push({
          id: Date.now().toString(),
          ...form,
          createdAt: new Date().toISOString(),
        });
        ElMessage.success('添加成功');
      }

      dialogVisible.value = false;
    } catch {
      ElMessage.error('操作失败');
    } finally {
      submitting.value = false;
    }
  });
}

// 删除
async function handleDelete(row: AiModel): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除模型「${row.name}」？此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'error' },
    );
    modelList.value = modelList.value.filter((m) => m.id !== row.id);
    ElMessage.success('删除成功');
  } catch {
    // 用户取消
  }
}

// 切换启用状态
async function handleToggleEnabled(row: AiModel): Promise<void> {
  row.enabled = !row.enabled;
  ElMessage.success(row.enabled ? '已启用' : '已禁用');
}

// 重置表单
function resetForm(): void {
  Object.assign(form, {
    name: '',
    provider: '',
    modelId: '',
    apiKey: '',
    endpoint: '',
    maxTokens: 4096,
    temperature: 0.7,
    enabled: true,
    description: '',
  });
}

// 关闭对话框
function handleDialogClose(): void {
  formRef.value?.resetFields();
  resetForm();
  editingId.value = null;
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="ai-model-config-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">AI 模型配置</h2>
      <el-button type="primary" icon="Plus" @click="handleAdd">添加模型</el-button>
    </div>

    <!-- 说明 -->
    <div class="card-container info-banner">
      <el-icon :size="20" color="#409eff"><InfoFilled /></el-icon>
      <span>
        配置用于 AI 小说转剧本生成的模型。启用的模型将可用于后台的剧本生成任务。API Key 会加密存储，请放心配置。
      </span>
    </div>

    <!-- 模型列表 -->
    <div class="card-container">
      <el-table v-loading="loading" :data="modelList" stripe border>
        <el-table-column prop="name" label="模型名称" min-width="160">
          <template #default="{ row }">
            <div class="model-name-cell">
              <span class="model-name">{{ row.name }}</span>
              <span class="model-desc text-ellipsis">{{ row.description }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="provider" label="供应商" width="130">
          <template #default="{ row }">
            <el-tag size="small">{{ getProviderLabel(row.provider) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="modelId" label="模型 ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="maxTokens" label="Max Tokens" width="120" />
        <el-table-column prop="temperature" label="Temperature" width="120" />
        <el-table-column prop="enabled" label="状态" width="90">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              @change="handleToggleEnabled(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="160">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="模型名称" prop="name">
          <el-input v-model="form.name" placeholder="例如: GPT-4o" maxlength="50" />
        </el-form-item>

        <el-form-item label="供应商" prop="provider">
          <el-select v-model="form.provider" placeholder="请选择供应商" style="width: 100%">
            <el-option
              v-for="option in providerOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="模型 ID" prop="modelId">
          <el-input v-model="form.modelId" placeholder="例如: gpt-4o" />
        </el-form-item>

        <el-form-item label="API Key" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            placeholder="请输入 API Key"
            show-password
          />
        </el-form-item>

        <el-form-item label="API 端点" prop="endpoint">
          <el-input
            v-model="form.endpoint"
            placeholder="例如: https://api.openai.com/v1"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Max Tokens" prop="maxTokens">
              <el-input-number
                v-model="form.maxTokens"
                :min="256"
                :max="128000"
                :step="256"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Temperature" prop="temperature">
              <el-slider
                v-model="form.temperature"
                :min="0"
                :max="2"
                :step="0.1"
                show-input
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="模型用途描述（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">
          {{ submitting ? '保存中...' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.ai-model-config-page {
  .info-banner {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 16px;
    background-color: rgba(64, 158, 255, 0.08);
    border-color: rgba(64, 158, 255, 0.2);
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.6;

    .el-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }
  }

  .model-name-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .model-name {
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
    }

    .model-desc {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.35);
      max-width: 250px;
    }
  }
}
</style>
