<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 面包屑数据
const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta?.title);
  return matched.map((item) => ({
    title: item.meta.title as string,
    path: item.path,
  }));
});

// 用户下拉菜单操作
function handleUserCommand(command: string): void {
  switch (command) {
    case 'profile':
      // TODO: 打开个人信息弹窗
      break;
    case 'logout':
      authStore.logout();
      break;
  }
}
</script>

<template>
  <div class="admin-header-content">
    <!-- 左侧: 折叠按钮 + 面包屑 -->
    <div class="header-left">
      <el-icon class="collapse-btn" :size="20" @click="emit('toggle')">
        <component :is="collapsed ? 'Expand' : 'Fold'" />
      </el-icon>

      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧: 用户操作 -->
    <div class="header-right">
      <!-- 全屏按钮 -->
      <el-tooltip content="全屏" placement="bottom">
        <el-icon class="action-icon" :size="18" @click="$emit('toggle')">
          <FullScreen />
        </el-icon>
      </el-tooltip>

      <!-- 通知按钮 -->
      <el-tooltip content="通知" placement="bottom">
        <el-badge :value="3" :max="99" class="notification-badge">
          <el-icon class="action-icon" :size="18">
            <Bell />
          </el-icon>
        </el-badge>
      </el-tooltip>

      <!-- 用户下拉菜单 -->
      <el-dropdown trigger="click" @command="handleUserCommand">
        <div class="user-info">
          <el-avatar :size="32" class="user-avatar">
            <el-icon :size="18"><User /></el-icon>
          </el-avatar>
          <span class="user-name">{{ authStore.userDisplayName }}</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人信息
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;

  .collapse-btn {
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #409eff;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;

  .action-icon {
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #409eff;
    }
  }

  .notification-badge {
    line-height: 1;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }

  .user-avatar {
    background-color: #409eff;
  }

  .user-name {
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .arrow-icon {
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
  }
}
</style>
