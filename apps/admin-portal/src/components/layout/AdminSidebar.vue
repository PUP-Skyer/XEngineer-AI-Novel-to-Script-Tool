<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

defineProps<{
  collapsed: boolean;
}>();

const route = useRoute();
const router = useRouter();

// 获取路由菜单项（过滤掉 hidden 的路由）
function getMenuItems(): RouteRecordRaw[] {
  const layoutRoute = router.options.routes.find((r) => r.path === '/');
  if (!layoutRoute?.children) return [];
  return layoutRoute.children.filter(
    (child) => !child.meta?.hidden && child.meta?.title,
  );
}

const menuItems = computed(() => getMenuItems());
const activeMenu = computed(() => {
  // 高亮当前匹配的菜单项
  const path = route.path;
  if (path.startsWith('/novels')) return '/novels';
  if (path.startsWith('/scripts')) return '/scripts';
  return path;
});

function handleMenuSelect(index: string): void {
  router.push(index);
}
</script>

<template>
  <div class="admin-sidebar">
    <!-- Logo 区域 -->
    <div class="sidebar-logo" :class="{ collapsed }">
      <div class="logo-icon">
        <el-icon :size="28"><Monitor /></el-icon>
      </div>
      <transition name="fade">
        <span v-if="!collapsed" class="logo-text">ASG Admin</span>
      </transition>
    </div>

    <!-- 菜单导航 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :collapse-transition="false"
      background-color="#1d1e2c"
      text-color="rgba(255, 255, 255, 0.65)"
      active-text-color="#409EFF"
      class="sidebar-menu"
      @select="handleMenuSelect"
    >
      <template v-for="item in menuItems" :key="item.path">
        <el-menu-item :index="item.path">
          <el-icon v-if="item.meta?.icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <template #title>{{ item.meta?.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>

    <!-- 底部版本信息 -->
    <div v-if="!collapsed" class="sidebar-footer">
      <span>v0.1.0</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sidebar-logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: padding 0.3s;

  &.collapsed {
    justify-content: center;
    padding: 0;
  }

  .logo-icon {
    color: #409eff;
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin-left: 12px;
    white-space: nowrap;
    letter-spacing: 0.5px;
  }
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  border-right: none;

  &:not(.el-menu--collapse) {
    width: 220px;
  }

  .el-menu-item {
    &:hover {
      background-color: rgba(64, 158, 255, 0.1) !important;
    }

    &.is-active {
      background-color: rgba(64, 158, 255, 0.15) !important;
      border-right: 3px solid #409eff;
    }
  }
}

.sidebar-footer {
  padding: 12px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
