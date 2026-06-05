<script setup lang="ts">
import { ref } from 'vue';
import AdminSidebar from './AdminSidebar.vue';
import AdminHeader from './AdminHeader.vue';

const isCollapsed = ref(false);

function toggleSidebar(): void {
  isCollapsed.value = !isCollapsed.value;
}
</script>

<template>
  <el-container class="admin-layout">
    <!-- 左侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="admin-aside">
      <AdminSidebar :collapsed="isCollapsed" />
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container class="admin-main-container">
      <!-- 顶部栏 -->
      <el-header class="admin-header">
        <AdminHeader :collapsed="isCollapsed" @toggle="toggleSidebar" />
      </el-header>

      <!-- 主内容区 -->
      <el-main class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.admin-aside {
  background-color: #1d1e2c;
  transition: width 0.3s;
  overflow: hidden;
}

.admin-main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  height: 56px;
  padding: 0 20px;
  background-color: #1d1e2c;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  background-color: #131420;
  padding: 20px;
}

// 路由过渡动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.25s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
