<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  status: 'active' | 'banned';
  role: 'user' | 'vip' | 'admin';
  gamesPlayed: number;
  createdAt: string;
  lastLoginAt: string;
}

// 列表数据
const userList = ref<User[]>([]);
const total = ref(0);
const loading = ref(false);

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  status: '',
});

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
});

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '正常', value: 'active' },
  { label: '已封禁', value: 'banned' },
];

// 模拟数据
function loadData(): void {
  loading.value = true;
  setTimeout(() => {
    userList.value = [
      {
        id: '1',
        username: '张三',
        email: 'zhangsan@example.com',
        phone: '138****8001',
        status: 'active',
        role: 'vip',
        gamesPlayed: 42,
        createdAt: '2024-01-10T08:00:00Z',
        lastLoginAt: '2024-03-20T14:30:00Z',
      },
      {
        id: '2',
        username: '李四',
        email: 'lisi@example.com',
        phone: '139****8002',
        status: 'active',
        role: 'user',
        gamesPlayed: 18,
        createdAt: '2024-02-05T08:00:00Z',
        lastLoginAt: '2024-03-19T10:15:00Z',
      },
      {
        id: '3',
        username: '王五',
        email: 'wangwu@example.com',
        phone: '137****8003',
        status: 'banned',
        role: 'user',
        gamesPlayed: 5,
        createdAt: '2024-02-20T08:00:00Z',
        lastLoginAt: '2024-03-10T09:00:00Z',
      },
      {
        id: '4',
        username: '赵六',
        email: 'zhaoliu@example.com',
        phone: '136****8004',
        status: 'active',
        role: 'user',
        gamesPlayed: 86,
        createdAt: '2024-01-01T08:00:00Z',
        lastLoginAt: '2024-03-20T16:45:00Z',
      },
    ];
    total.value = 4;
    loading.value = false;
  }, 500);
}

// 状态映射
function getStatusType(status: string): 'success' | 'danger' {
  return status === 'active' ? 'success' : 'danger';
}

function getStatusLabel(status: string): string {
  return status === 'active' ? '正常' : '已封禁';
}

function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    user: '普通用户',
    vip: 'VIP 用户',
    admin: '管理员',
  };
  return map[role] || role;
}

function getRoleType(role: string): '' | 'success' | 'warning' {
  const map: Record<string, '' | 'success' | 'warning'> = {
    user: '',
    vip: 'success',
    admin: 'warning',
  };
  return map[role] || '';
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
  queryParams.pageSize = 20;
  loadData();
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

// 封禁用户
async function handleBan(row: User): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认封禁用户「${row.username}」？封禁后用户将无法登录。`,
      '封禁确认',
      { confirmButtonText: '封禁', cancelButtonText: '取消', type: 'warning' },
    );
    row.status = 'banned';
    ElMessage.success('已封禁');
  } catch {
    // 用户取消
  }
}

// 解封用户
async function handleUnban(row: User): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认解封用户「${row.username}」？`,
      '解封确认',
      { confirmButtonText: '解封', cancelButtonText: '取消', type: 'info' },
    );
    row.status = 'active';
    ElMessage.success('已解封');
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="user-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
    </div>

    <!-- 搜索栏 -->
    <div class="card-container search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名/邮箱/手机号"
            clearable
            style="width: 240px"
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
      <el-table v-loading="loading" :data="userList" stripe border>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="role" label="角色" width="110">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)" size="small">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gamesPlayed" label="游戏场次" width="90" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="170">
          <template #default="{ row }">
            {{ new Date(row.lastLoginAt).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="170">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="140">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'active'"
              type="danger"
              link
              size="small"
              @click="handleBan(row)"
            >
              封禁
            </el-button>
            <el-button
              v-else
              type="success"
              link
              size="small"
              @click="handleUnban(row)"
            >
              解封
            </el-button>
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
.user-list-page {
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
