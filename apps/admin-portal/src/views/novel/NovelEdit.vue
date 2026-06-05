<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

const route = useRoute();
const router = useRouter();

const novelId = route.params.id as string;
const isEdit = ref(true); // 标识是编辑还是新建

const formRef = ref<FormInstance>();
const submitting = ref(false);

const form = reactive({
  title: '',
  author: '',
  genre: '',
  synopsis: '',
  content: '',
});

const rules: FormRules = {
  title: [
    { required: true, message: '请输入书名', trigger: 'blur' },
    { max: 100, message: '书名最长 100 个字符', trigger: 'blur' },
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' },
    { max: 50, message: '作者名最长 50 个字符', trigger: 'blur' },
  ],
  genre: [{ required: true, message: '请选择类型', trigger: 'change' }],
  synopsis: [
    { required: true, message: '请输入简介', trigger: 'blur' },
    { max: 2000, message: '简介最长 2000 个字符', trigger: 'blur' },
  ],
};

const genreOptions = [
  '科幻',
  '武侠',
  '现实',
  '悬疑',
  '言情',
  '历史',
  '奇幻',
  '恐怖',
  '其他',
];

// 模拟加载小说数据
function loadNovelData(): void {
  if (novelId) {
    form.title = '三体';
    form.author = '刘慈欣';
    form.genre = '科幻';
    form.synopsis =
      '文化大革命如火如荼进行的同时，军方探寻外星文明的绝密计划"红岸工程"取得了突破性进展。';
    form.content = '（小说内容加载中...）';
  }
}

// 返回
function goBack(): void {
  router.back();
}

// 保存
async function handleSave(): Promise<void> {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    submitting.value = true;
    try {
      // TODO: 替换为实际 API 调用
      // if (novelId) {
      //   await apiClient.novel.update(novelId, form);
      // } else {
      //   await apiClient.novel.create(form);
      // }

      await new Promise((resolve) => setTimeout(resolve, 800)); // 模拟请求

      ElMessage.success(isEdit.value ? '保存成功' : '创建成功');
      router.push('/novels');
    } catch {
      ElMessage.error('保存失败');
    } finally {
      submitting.value = false;
    }
  });
}

onMounted(() => {
  loadNovelData();
});
</script>

<template>
  <div class="novel-edit-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-button icon="ArrowLeft" @click="goBack">返回</el-button>
        <h2 class="page-title">{{ isEdit ? '编辑小说' : '添加小说' }}</h2>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">
          {{ submitting ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </div>

    <!-- 表单 -->
    <div class="card-container">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        label-position="top"
        class="edit-form"
      >
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="书名" prop="title">
              <el-input v-model="form.title" placeholder="请输入书名" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="form.author" placeholder="请输入作者" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="类型" prop="genre">
              <el-select v-model="form.genre" placeholder="请选择类型" style="width: 100%">
                <el-option
                  v-for="genre in genreOptions"
                  :key="genre"
                  :label="genre"
                  :value="genre"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="简介" prop="synopsis">
          <el-input
            v-model="form.synopsis"
            type="textarea"
            :rows="4"
            placeholder="请输入小说简介"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="15"
            placeholder="请输入小说内容（或上传文件）"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.novel-edit-page {
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

  .edit-form {
    max-width: 900px;
  }
}
</style>
